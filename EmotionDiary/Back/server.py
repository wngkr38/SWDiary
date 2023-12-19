from flask import request
import pymysql
from flask import Flask, jsonify, request

app = Flask(__name__)


def get_db_connection():  # db 연결
    return pymysql.connect(host='localhost', port=3306, user='root',
                           passwd='gyals13~', db='diary', charset='utf8')


def execute_query(query, params):  # 쿼리 db로 보내기 연결
    db = get_db_connection()
    cursor = db.cursor()
    try:
        cursor.execute(query, params)
        db.commit()
        return cursor.fetchall()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


def create_response(message, status_code):  # 오류 메세지 등등 클라이언트로 보냄
    return message + '\n', status_code


@app.route('/')
def index():
    result = execute_query("SELECT nickname FROM user_info;", ())

    keys = ('nickname',)
    result_dict = [dict(zip(keys, values)) for values in result]

    return jsonify(result_dict)


@app.route('/loginInfo', methods=['POST'])
def save_user_info():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        user_email = data.get('userEmail', None)

        if user_email is not None:
            execute_query(
                "INSERT INTO user_info (id, email) VALUES (%s,%s);", (user_id, user_email))
        else:
            execute_query(
                "INSERT INTO user_info (id) VALUES (%s);", (user_id,))

        return create_response('사용자 정보가 성공적으로 저장되었습니다.', 200)

    except Exception as e:
        return create_response('사용자 정보 저장 중 오류 발생: ' + str(e), 500)


@app.route('/getUserInfo', methods=['GET'])  # 사용자 정보 받아오기
def get_UserInfo():
    try:
        result = execute_query(
            "SELECT id FROM user_info;", ())
        if result:
            idList = [row[0] for row in result]
            return jsonify({'idList': idList}), 200
        else:
            return create_response('유저가 아무도 없습니다.', 404)

    except Exception as e:
        return create_response('날짜 조회 중 오류 발생: ' + str(e), 500)


@app.route('/saveNickname', methods=['POST'])  # 닉네임 생성
def save_nickname():
    data = request.get_json()
    nickname = data.get('nickname')
    id = data.get('id')
    email = data.get('email')

    try:
        execute_query(
            "INSERT INTO user_info (id, nickname, email) VALUES (%s, %s, %s);", (id, nickname, email))
        return create_response('닉네임이 성공적으로 저장되었습니다.', 200)
    except Exception as e:
        return create_response('닉네임 저장 중 오류 발생: ' + str(e), 500)


@app.route('/addFriendRequest', methods=['POST'])  # 친추 보낼때
def add_friend_request():
    data = request.get_json()
    sender_id = data.get('userNickname')
    receiver_id = data.get('friendNickname')

    try:
        results = execute_query("SELECT nickname FROM user_info", ())
        friends_list = [row[0] for row in results]
        if receiver_id not in friends_list:
            return create_response('존재하지 않는 친구입니다.', 400)

        existing_request = execute_query(
            "SELECT * FROM friends WHERE sender_id = %s AND receiver_id = %s", (sender_id, receiver_id))
        if existing_request:
            return create_response('이미 친구 요청을 보냈습니다.', 401)

        execute_query(
            "INSERT INTO friends (sender_id, receiver_id, status) VALUES (%s, %s, 'pending')", (sender_id, receiver_id))

        return create_response('친구 요청이 성공적으로 처리되었습니다.', 200)

    except Exception as e:
        return create_response('친구 요청 처리 중 오류 발생: ' + str(e), 500)


@app.route('/getFriends', methods=['POST'])  # 친구 목록, 받은 요청 조회
def get_friends():
    data = request.get_json()
    nickname = data.get('nickname')
    try:
        ListResult = execute_query(
            "SELECT DISTINCT CASE WHEN sender_id = %s THEN receiver_id ELSE sender_id END AS result FROM friends WHERE status = 'accept' AND (sender_id = %s OR receiver_id = %s) AND NOT (sender_id = %s AND receiver_id = %s)", (nickname, nickname, nickname, nickname, nickname))
        friends_list = [row[0] for row in ListResult]

        RequestResult = execute_query(
            "SELECT sender_id FROM friends WHERE receiver_id = %s AND status ='pending'", (nickname,))
        received_requests_list = [row[0] for row in RequestResult]

        response_data = {
            'friends': friends_list,
            'received_requests': received_requests_list
        }

        return jsonify(response_data), 200

    except Exception as e:
        return create_response('친구 목록 및 요청 조회 중 오류 발생: ' + str(e), 500)


@app.route('/deleteFriend', methods=['POST'])  # 친구 삭제
def delete_Friend():
    data = request.get_json()
    userName = data.get('userNickname')
    FriendName = data.get('friendNickname')

    try:
        execute_query("DELETE FROM friends WHERE status='accept' AND ((sender_id=%s AND receiver_id=%s) OR  (receiver_id=%s AND sender_id=%s))",
                      (userName, FriendName, userName, FriendName))
        return create_response('친구가 삭제되었습니다.', 200)
    except Exception as e:
        return create_response('친구 삭제중 오류 발생: ' + str(e), 500)


@app.route('/deleteRequestFriend', methods=['POST'])  # 친구 요청 삭제
def delete_FriendRequest():
    data = request.get_json()
    userName = data.get('userNickname')
    FriendName = data.get('friendNickname')

    try:
        execute_query(
            "DELETE FROM friends WHERE status='pending' AND (sender_id=%s AND receiver_id=%s)", (FriendName, userName))
        return create_response('친구 요청이 삭제되었습니다.', 200)
    except Exception as e:
        return create_response('친구 요청 삭제중 오류 발생: ' + str(e), 500)


@app.route('/AcceptRequestFriend', methods=['POST'])  # 친구 요청 허용
def accept_FriendRequest():
    data = request.get_json()
    userName = data.get('userNickname')
    FriendName = data.get('friendNickname')

    try:
        execute_query(
            "UPDATE friends SET status='accept' WHERE status='pending' AND (sender_id=%s AND receiver_id=%s)", (FriendName, userName))
        return create_response('친구 요청이 허가되었습니다.', 200)
    except Exception as e:
        return create_response('친구 요청 허용중 오류 발생: ' + str(e), 500)
# 일기 저장 하루에 하나씩 10/20


@app.route('/saveDiary', methods=['POST'])  # 일기 저장
def save_Diary():
    if 'image' in request.files:
        image_file = request.files['image']
        filename = secure_filename(image_file.filename)
        image_path = os.path.join(filename)  # os -> 로컬 관련인듯 프로젝트에 사진이 추가 댐.

        # 이미지 파일을 임시 디렉토리에 저장합니다.
        image_file.save(image_path)

        # Firebase Storage에 이미지 업로드합니다.
        bucket = storage.bucket()
        blob = bucket.blob(filename)

        with open(image_path, "rb") as my_file:
            blob.upload_from_file(my_file)

    else:
        image_path = None

    data = request.form  # 클라이언트에서 전송한 JSON 데이터를 받아옵니다.
    name = data.get('name')  # 클라이언트에서 전송한 'nickname' 값을 추출합니다.
    title = data.get('title')  # 제목
    year = data.get('year')  # 년도
    month = data.get('month')  # 월
    day = data.get('day')  # 일
    dayOfWeek = data.get('dayOfWeek')  # 요일
    content = data.get('content')  # 내용
    emotion_index = data.get('emotion_index')  # 감정값
    lock_state = data.get('lock_state')  # 잠금상태
    date_today_str = str(year)+'-'+str(month).zfill(2)+'-'+str(day).zfill(2)

    try:
        result_last_diary_date = execute_query(
            "SELECT MAX(date) FROM written_diary WHERE name=%s;", (name,))
        last_diary_date_str = result_last_diary_date[0][0]

        if last_diary_date_str == date_today_str:
            return create_response("오늘은 이미 다이어리를 작성했습니다.", 400)

        execute_query("INSERT INTO written_diary (name, title, date, dayOfWeek, content, image_path, emotion_index, lock_state) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);",
                      (name, title, date_today_str, dayOfWeek, content, image_path, emotion_index, lock_state))
        os.remove(image_path)  # 일기가 저장되면 프로젝트 폴더안에 저장된 이미지 삭제.
        return create_response("일기가 저장되었습니다.", 200)

    except Exception as e:
        return create_response("일기 저장중 오류 발생: "+str(e), 500)


@app.route('/getDiary', methods=['POST'])  # 일기장 받아오기 값 가져와지는지는 모름 10-16
def get_Diary():
    data = request.get_json()
    name = data.get('name')

    try:
        result = execute_query(
            "SELECT id, name, title, date, dayOfWeek, content ,image_path,emotion_index FROM written_diary WHERE name = %s ORDER BY date DESC;", (name,))

        if not result:  # 데이터가 비어있는 경우
            return create_response('데이터가 비어있습니다.', 204)

        if result:
            diaries = []
            for row in result:
                id, name, title, date, dayOfWeek, content,  image_path, emotion_index = row
                diary_data = {
                    'id': id,
                    'name': name,
                    'title': title,
                    'date': date,
                    'dayOfWeek': dayOfWeek,
                    'content': content,
                    'image_path': image_path,
                    'emotion_index': emotion_index
                }
                diaries.append(diary_data)

        if diaries:
            return jsonify({'diaries': diaries}), 200
        else:
            return create_response('해당하는 일기가 없습니다.', 404)

    except Exception as e:
        return create_response('일기 조회 중 오류 발생: ' + str(e), 500)


@app.route('/getFriendDiary', methods=['POST'])  # 일기장 받아오기
def get_FriendDiary():
    data = request.get_json()
    name = data.get('name')

    try:
        result = execute_query(
            "SELECT id, name, title, date, dayOfWeek, content ,image_path, emotion_index FROM written_diary WHERE name = %s AND lock_state = 'unlock' ORDER BY date DESC;", (name,))

        if not result:  # 데이터가 비어있는 경우
            return create_response('데이터가 비어있습니다.', 204)

        if result:
            diaries = []
            for row in result:
                id, name, title, date, dayOfWeek, content,  image_path, emotion_index = row
                diary_data = {
                    'id': id,
                    'name': name,
                    'title': title,
                    'date': date,
                    'dayOfWeek': dayOfWeek,
                    'content': content,
                    'image_path': image_path,
                    'emotion_index': emotion_index
                }
                diaries.append(diary_data)

        if diaries:
            return jsonify({'diaries': diaries}), 200
        else:
            return create_response('해당하는 일기가 없습니다.', 404)

    except Exception as e:
        return create_response('일기 조회 중 오류 발생: ' + str(e), 500)


@app.route('/editDiary', methods=['POST'])  # 일기장 수정하기 누르면 입력했던 일기 가져오기
def edit_Diary():
    data = request.get_json()
    name = data.get('name')
    id = data.get('id')

    try:
        result = execute_query(
            "SELECT id, name, title, date, dayOfWeek, content ,image_path,  emotion_index, lock_state FROM written_diary WHERE name = %s AND id = %s;", (name, id))
        if result:
            diaries = []
            for row in result:
                id, name, title, date, dayOfWeek, content,  image_path,  emotion_index, lock_state = row
                diary_data = {
                    'id': id,
                    'name': name,
                    'title': title,
                    'date': date,
                    'dayOfWeek': dayOfWeek,
                    'content': content,
                    'image_path': image_path,
                    'emotion_index':  emotion_index,
                    'lock_state': lock_state
                }
                diaries.append(diary_data)

        if diaries:
            return jsonify({'diaries': diaries}), 200
        else:
            return create_response('해당하는 일기가 없습니다.', 404)

    except Exception as e:
        return create_response('일기 조회 중 오류 발생: ' + str(e), 500)


@app.route('/editDiary2', methods=['POST'])  # 일기장 수정완료 누를 시 진짜 수정하기
def edit2_Diary():

    if 'image' in request.files:
        image_file = request.files['image']
        filename = secure_filename(image_file.filename)
        image_path = os.path.join(filename)  # os -> 로컬 관련인듯 프로젝트에 사진이 추가 댐.

        # 이미지 파일을 임시 디렉토리에 저장합니다.
        image_file.save(image_path)

        # Firebase Storage에 이미지 업로드합니다.
        bucket = storage.bucket()
        blob = bucket.blob(filename)

        with open(image_path, "rb") as my_file:
            blob.upload_from_file(my_file)

    else:
        image_path = None

    data = request.form
    id = data.get('id')
    name = data.get('name')
    title = data.get('title')
    content = data.get('content')
    emotion_index = data.get('emotion_index')
    lock_state = data.get('lock_state')
    print(lock_state)
    print(id)
    print(name)
    try:
        execute_query(
            "UPDATE written_diary SET title=%s, content=%s, image_path=%s, emotion_index=%s, lock_state=%s WHERE name=%s AND id=%s", (title, content, image_path, emotion_index, lock_state, name, id))
        execute_query(
            "UPDATE comments SET title=%s WHERE friend_diary_id=%s", (title, id))
        execute_query(
            "UPDATE reply SET title=%s WHERE friend_diary_id=%s", (title, id))
        return create_response('일기가 저장되었습니다.', 200)
    except Exception as e:
        return create_response('일기 저장중 오류 발생: ' + str(e), 500)


@app.route('/deleteDiary', methods=['POST'])  # 일기장 삭제
def delete_Diary():
    data = request.get_json()
    id = data.get('id')
    name = data.get('name')

    try:
        execute_query(
            "DELETE FROM written_diary WHERE name=%s AND id=%s", (name, id))
        return create_response('일기가 삭제되었습니다.', 200)
    except Exception as e:
        return create_response('일기 삭제중 오류 발생: ' + str(e), 500)


@app.route('/getDates', methods=['POST'])  # 날짜와 감정 지수 받아오기
def get_Dates():
    data = request.get_json()
    name = data.get('name')

    try:
        result = execute_query(
            "SELECT date, emotion_index FROM written_diary WHERE name = %s;", (name,))
        if result:
            dates_with_emotion = [{'date': row[0], 'emotion_index': row[1]} for row in result]
            return jsonify({'dates_with_emotion': dates_with_emotion}), 200
        else:
            return create_response('이 사람은 일기를 쓴 적이 없습니다.', 404)

    except Exception as e:
        return create_response('날짜 조회 중 오류 발생: ' + str(e), 500)


@app.route('/sendmessage', methods=['POST'])  # 메세지 전송
def send_Message():
    data = request.get_json()  # 클라이언트에서 전송한 JSON 데이터를 받아옵니다.
    from_name = data.get('from_name')  # 보낸 사람 추출
    to_name = data.get('to_name')  # 받는 사람
    content = data.get('content')  # 메시지 내용
    time = data.get('time')  # 시간
    # read = data.get('read')  # 읽었는지 여부 - 보류

    # 닉네임을 데이터베이스에 저장하는 코드를 작성합니다.
    # 예: 닉네임을 user_info 테이블에 삽입
    db = get_db_connection()
    cursor = db.cursor()
    sql = "INSERT INTO chat (from_name, to_name, content, time) VALUES (%s, %s, %s, %s);"
    try:
        cursor.execute(
            sql, (from_name, to_name, content, time))
        db.commit()
        return '메시지 전송 성공.', 200
    except Exception as e:
        db.rollback()
        print("Error occurred:", e)
        return '메시지 전송 중 오류 발생: ' + str(e), 500
    finally:
        db.close()

@app.route('/getGptResponse', methods=['POST'])  # 메세지 전송
def getGptResponse():
    data = request.get_json()  # 클라이언트에서 전송한 JSON 데이터를 받아옵니다.
    from_name = data.get('from_name')  # 보낸 사람 추출
    to_name = data.get('to_name')  # 받는 사람
    content = data.get('content')  # 메시지 내용
    time = data.get('time')  # 시간
    # read = data.get('read')  # 읽었는지 여부 - 보류

    # 닉네임을 데이터베이스에 저장하는 코드를 작성합니다.
    # 예: 닉네임을 user_info 테이블에 삽입
    db = get_db_connection()
    cursor = db.cursor()
    sql = "INSERT INTO chat (from_name, to_name, content, time) VALUES (%s, %s, %s, %s);"
    try:
        cursor.execute(
            sql, (from_name, to_name, content, time))
        db.commit()
        return '메시지 전송 성공.', 200
    except Exception as e:
        db.rollback()
        print("Error occurred:", e)
        return '메시지 전송 중 오류 발생: ' + str(e), 500
    finally:
        db.close()


@app.route('/getmessage', methods=['POST'])  # 메시지 받아오기
def get_Message():
    data = request.get_json()  # 클라이언트에서 전송한 JSON 데이터를 받아옵니다.
    name = data.get('name')  # JSON 데이터에서 'name' 필드의 값을 추출합니다.

    db = get_db_connection()  # 데이터베이스 연결을 가져옵니다.
    cursor = db.cursor()  # 쿼리를 실행하기 위한 커서 객체를 생성합니다.
    select_sql = "SELECT id, from_name, to_name, content, time FROM chat WHERE from_name = %s or to_name = %s ;"

    try:
        # SQL 쿼리문을 실행합니다. 여기서 'name' 변수는 사용자 이름입니다.
        cursor.execute(select_sql, (name, name))
        result = cursor.fetchall()  # 쿼리 결과를 모두 가져옵니다.
        if result:
            chat = []
            for row in result:
                id, from_name, to_name, content, time = row
                chat_data = {
                    'id': id,  # 테이블 id
                    'from_name': from_name,  # 보낸사람 이름
                    'to_name': to_name,  # 받는사람 이름
                    'content': content,  # 채팅 텍스트 내용
                    'time': time,  # 보낸 시간
                }
                chat.append(chat_data)

            return {
                'chat': chat
            }, 200

        else:
            return '채팅이 없습니다.', 404

    except Exception as e:
        import traceback
        print("Error occurred:", e)
        print(traceback.format_exc())

        return '채팅 조회 중 오류 발생: ', 500

    finally:
        db.close()


@app.route('/writeComment', methods=['POST'])  # 댓글 저장
def write_Comment():
    data = request.get_json()  # 클라이언트에서 전송한 JSON 데이터를 받아옵니다.
    id = data.get('id')  # 친구 다이어리 아이디
    name = data.get('name')  # 친구 닉네임
    user_name = data.get('user_name')  # 본인 닉네임
    title = data.get('title')  # 제목
    comment = data.get('comment')
    dateTime = data.get('dateTime')  # 날짜, 시간
    checked = data.get('check')

    try:
        execute_query("INSERT INTO comments (friend_diary_id, friend_name, user_name, title, comment, dateTime, checked) VALUES (%s, %s, %s, %s, %s, %s, %s);",
                      (int(id), name, user_name, title, comment, dateTime, checked))
        return create_response('댓글이 저장되었습니다.', 200)
    except Exception as e:
        return create_response('댓글 저장중 오류 발생: ' + str(e), 500)


@app.route('/deleteComment', methods=['POST'])  # 친구 삭제
def delete_Comment():
    data = request.get_json()
    id = data.get('id')

    try:
        execute_query("DELETE FROM comments WHERE id = %s", (id))
        execute_query("DELETE FROM reply WHERE comment_id = %s", (id))
        return create_response('댓글이 삭제되었습니다.', 200)
    except Exception as e:
        return create_response('댓글 삭제중 오류 발생: ' + str(e), 500)


@app.route('/fetchComments', methods=['POST'])  # 댓글들 받아오기
def get_Comments():
    data = request.get_json()
    id = data.get('id')
    name = data.get('name')
    title = data.get('title')
    print(id)
    print(name)
    print(title)
    try:
        result = execute_query(
            "SELECT id, friend_diary_id, friend_name, user_name, title, comment,  dateTime FROM comments WHERE friend_diary_id = %s AND friend_name = %s AND title = %s;", (id, name, title))

        if not result:  # 데이터가 비어있는 경우
            return create_response('데이터가 비어있습니다.', 204)

        if result:
            comments = []
            for row in result:
                id, friend_diary_id, friend_name, user_name, title, comment,  dateTime = row
                comments_data = {
                    'id': id,
                    'friend_diary_id': friend_diary_id,
                    'friend_name': friend_name,
                    'user_name': user_name,
                    'title': title,
                    'comment': comment,
                    'dateTime': dateTime
                }
                comments.append(comments_data)

        if comments:
            return jsonify({'comments': comments}), 200
        else:
            return create_response('작성된 댓글이 없습니다.', 404)

    except Exception as e:
        return create_response('댓글 조회 중 오류 발생: ' + str(e), 500)


@app.route('/writeReply', methods=['POST'])  # 대댓글 저장
def write_Reply():
    data = request.get_json()  # 클라이언트에서 전송한 JSON 데이터를 받아옵니다.
    friend_diary_id = data.get('friend_diary_id')  # 친구 다이어리 아이디
    comment_id = data.get('comment_id')  # 댓글 아이디
    friend_name = data.get('friend_name')  # 친구 닉네임
    user_name = data.get('user_name')  # 본인 닉네임
    to_user = data.get('to_user')  # 누구한테 남기는지
    reply = data.get('reply')  # 대댓글
    dateTime = data.get('dateTime')  # 날짜, 시간
    title = data.get('title')  # 제목
    try:
        execute_query("INSERT INTO reply (friend_diary_id, comment_id, friend_name, user_name, to_user, reply, dateTime, checked , title) VALUES (%s, %s, %s, %s, %s, %s, %s, 'unread', %s);",
                      (friend_diary_id, comment_id, friend_name, user_name, to_user, reply, dateTime, title))
        return create_response('댓글이 저장되었습니다.', 200)
    except Exception as e:
        return create_response('댓글 저장중 오류 발생: ' + str(e), 500)


@app.route('/deleteReply', methods=['POST'])  # 친구 삭제
def delete_Reply():
    data = request.get_json()
    id = data.get('id')

    try:
        execute_query("DELETE FROM reply WHERE id = %s", (id))

        return create_response('대댓글이 삭제되었습니다.', 200)
    except Exception as e:
        return create_response('대댓글 삭제중 오류 발생: ' + str(e), 500)


@app.route('/fetchReplies', methods=['POST'])  # 대댓글들 받아오기
def get_Replies():
    data = request.get_json()
    friend_diary_id = data.get('friend_diary_id')
    friend_name = data.get('friend_name')

    print(friend_diary_id)
    print(friend_name)
    try:
        result = execute_query(
            "SELECT id, friend_diary_id, comment_id ,friend_name, user_name, to_user, reply, dateTime FROM reply WHERE friend_diary_id = %s AND friend_name = %s ;", (friend_diary_id, friend_name))

        if not result:  # 데이터가 비어있는 경우
            return create_response('데이터가 비어있습니다.', 204)

        if result:
            replies = []
            for row in result:
                id, friend_diary_id, comment_id, friend_name, user_name, to_user, reply,  dateTime = row
                replies_data = {
                    'id': id,
                    'comment_id': comment_id,
                    'friend_diary_id': friend_diary_id,
                    'friend_name': friend_name,
                    'user_name': user_name,
                    'to_user': to_user,
                    'reply': reply,
                    'dateTime': dateTime
                }
                replies.append(replies_data)

        if replies:
            return jsonify({'replies': replies}), 200
        else:
            return create_response('작성된 댓글이 없습니다.', 404)

    except Exception as e:
        return create_response('댓글 조회 중 오류 발생: ' + str(e), 500)


@app.route('/getNotice', methods=['POST'])  # 받은 알림
def get_Notice():
    data = request.get_json()
    userName = data.get('friend_name')  # 내 닉네임
    try:
        commentResult = execute_query(
            "SELECT title, friend_diary_id FROM comments WHERE friend_name = %s AND checked = 'unread';", (userName))
        comment_list = [(row[0], row[1]) for row in commentResult]

        replyResult = execute_query(
            "SELECT title, friend_diary_id FROM reply WHERE friend_name = %s AND checked = 'unread';", (userName))
        reply_list = [(row[0], row[1]) for row in replyResult]

        response_data = {
            'comments': comment_list,
            'replies': reply_list
        }
        print(comment_list)
        print(reply_list)
        return jsonify(response_data), 200

    except Exception as e:
        return create_response('받은 알림 조회 중 오류 발생: ' + str(e), 500)


@app.route('/changeCheck', methods=['POST'])  # check 값 바꾸기
def change_Check():
    data = request.get_json()
    friend_name = data.get('friend_name')
    friend_diary_id = data.get('friend_diary_id')

    try:
        execute_query(
            "UPDATE comments SET checked ='read' WHERE friend_name=%s AND friend_diary_id = %s", (friend_name, int(friend_diary_id)))
        execute_query(
            "UPDATE reply SET checked ='read' WHERE friend_name=%s AND friend_diary_id = %s", (friend_name, int(friend_diary_id)))

        return create_response('checked 값이 바뀜.', 200)
    except Exception as e:
        return create_response('checked 값 바꾸는 도중 오류 발생: ' + str(e), 500)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port="9090", debug=True)
