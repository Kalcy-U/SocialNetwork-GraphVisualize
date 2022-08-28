import codecs

from itsdangerous import json

from py.SocialNetwork.graph import  Graph
from flask import Flask, render_template, request


def load_info():
	snw=Graph(58,3981)
	snw.give_node_data('.\\static\\data\\3980.circles')
	snw.give_relations('.\\static\\data\\3980.edges')
	return snw


app = Flask(__name__)

@app.route("/")
def hello_world():
	return render_template('index.html')

@app.route('/search_recommended', methods=['GET'])
def search_recommended():
	user1 = request.args.get("Uname1")
	user2 = request.args.get("Uname2")

	result = {}
	result['success']=False
	result['friends']=[]
	result['info'] = '找不到用户，请检查输入是否正确'
	if user1 and user2:
		info1 = snw.get_user_info(user1)
		info2 = snw.get_user_info(user2)
		if info1 and info2:
			# 共同好友id列表
			result['friends'] = snw.commen_friend(info1['id'],info2['id'])
			r_friend=len(result['friends'])
			result['user1']=info1
			result['user2']=info2
			#提示信息
			if info1['group']!=[] and info1['group']==info2['group']:
				result['info']=("{}({})与{}({})的共同好友数为{}，且两人是同校。").format(info1['Uname'],info1['id'],info2['Uname'],info2['id'],r_friend)

			else:
				result['info'] = ("{}({})与{}({})的共同好友数为{}，两人不是同校。").format(info1['Uname'], info1['id'], info2['Uname'],
																		   info2['id'], r_friend)
			result['success'] = True

	return json.dumps(result,ensure_ascii=False).encode('utf-8')

@app.route('/static/data/jdata_r.json', methods=['GET'])
def get_data():
	#print('ok')
	file = codecs.open('static/data/jdata_r.json', 'r', 'utf-8')
	if(file):
		#print('ok')
		data=json.load(file)
		return data



if __name__ == '__main__':
	snw = load_info()
	snw.form_json_data_with_recommend('.\\static\\data\\jdata_r.json')
	app.run()



