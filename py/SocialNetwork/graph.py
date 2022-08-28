import codecs
import json

import pandas
from faker import Faker
import re


class Graph:
    def __init__(self, n_vertices, start_id):
        self.vexnum = n_vertices
        self.start_id = start_id
        self.arcnum = 0
        self.adj = [[] for _ in range(n_vertices)]
        self.nodes = [dict(Uname=None, id=None, group=[], index=None, recommend=[]) for _ in range(n_vertices)]
        self.links = []  # 方便起见，将节点对单独存储（无向边）
        self.groups = []

    def give_node_data(self, circle_path):
        # id，姓名
        for i in range(self.vexnum):
            self.nodes[i] = dict(id=i + self.start_id, Uname=Faker('zh_CN').name(), group=[], index=i)
        # 群组
        with open(circle_path, 'r') as file1:
            circles = file1.readlines()
            idx = 0
            for circle in circles:
                members = re.split('[ |\t]', circle.split('\n')[0])
                _group = []
                # print(members)
                for i in range(1, len(members)):
                    # print(int(members[i]) - self.start_id)
                    memberIdx = int(members[i]) - self.start_id
                    self.nodes[memberIdx]['group'].append(idx)
                    _group.append(memberIdx)
                idx += 1
                self.groups.append(_group)

    def give_relations(self, _path):
        # 关系
        # 节点对（用于生成json）
        relations = pandas.DataFrame(pandas.read_csv(_path, sep=' ', names=['A', 'B']))
        for i in range(len(relations)):
            self.links.append(
                dict(source=int(relations.loc[i, 'A']), target=int(relations.loc[i, 'B']), relation='friend'))
        # 邻接表
        # print(self.links[0:10])

        for link in self.links:
            # print(link)
            self.adj[link['source'] - self.start_id].append(link['target'] - self.start_id)  # 索引到nodes的index
            self.adj[link['target'] - self.start_id].append(link['source'] - self.start_id)  # 无向图

    def form_json_data(self, savepath):

        file = codecs.open(savepath, 'w', 'utf-8')
        json.dump(dict(links=self.links, nodes=self.nodes), file, ensure_ascii=False, indent=1)

    def recommend_by_common_friend(self, userId):
        # 按共同好友数量推荐感兴趣的用户,返回推荐列表
        userIndex = userId - self.start_id
        assist = [0.0 for _ in range(self.vexnum)]  # 包含所有成员的一张列表，用于记录共同好友数量
        assist[userIndex] = -1
        for friend in self.adj[userIndex]:
            assist[friend] = -1  # 直接好友标记为-1，不参与推荐
        for friend in self.adj[userIndex]:
            # 这里的friend是node的下标，表示user的好友
            for ff in self.adj[friend]:
                # 遍历朋友的朋友->ff
                if assist[ff] >= 0:
                    assist[ff] += 1  # 共同好友数加一
        return assist

    def recommend_by_common_group(self, userId):
        userIndex = userId - self.start_id
        assist = [0.0 for _ in range(self.vexnum)]  # 包含所有成员的一张列表，用于记录共同好友数量
        assist[userIndex] = -1
        # 排除已有的好友
        for friend in self.adj[userIndex]:
            # 这里的friend是node的下标，表示user的好友
            assist[friend] = -1  # 直接好友标记为-1，不参与推荐
        for group in self.nodes[userIndex]['group']:
            for member in self.groups[group]:
                if assist[member] >= 0:
                    assist[member] +=1
        return assist

    def recommendilist(self, userId, length, friend_weight=1.5, group_weight=0.4):
        assist = []
        friend_array = [0 for _ in range(self.vexnum)]
        group_array = [0 for _ in range(self.vexnum)]
        if friend_weight != 0:
            friend_array = self.recommend_by_common_friend(userId)
        # print(friend_array)
        if group_weight != 0:
            group_array = self.recommend_by_common_group(userId)
        # print(group_array)
        for i in range(self.vexnum):
            g=1 if group_array[i]>0 else 0
            r = friend_array[i] * friend_weight *(g * group_weight +1)
            assist.append((r, i))
        assist.sort(reverse=True, key=lambda d: d[0])  # 得到推荐指数列表，排序
        recommendlist = []
        count = 0
        for j in range(self.vexnum):
            r = assist[j][0]
            idx = assist[j][1]
            if r > 0 and count < length:
                recommendinfo = {}
                recommendinfo['id'] = self.nodes[idx]['id']
                recommendinfo['Uname'] = self.nodes[idx]['Uname']
                recommendinfo['recommended'] = r
                recommendlist.append(recommendinfo)
                count += 1
            else:
                break
        return recommendlist

    def form_json_data_with_recommend(self, savepath):
        for idx in range(self.vexnum):
            rlist = self.recommendilist(idx + self.start_id, length=10, friend_weight=1, group_weight=0.4)
            print(rlist)
            self.nodes[idx]['recommend'] = rlist
        file = codecs.open(savepath, 'w', 'utf-8')
        json.dump(dict(links=self.links, nodes=self.nodes), file, ensure_ascii=False, indent=1)

    def get_user_info(self,sign):
        if type (sign) == int or (type(sign)==str and sign.isdigit() ):
            idx=int(sign)-self.start_id
            if(idx>=0 and idx<self.vexnum):
                return self.nodes[idx]
        else:
            for node in self.nodes:
                if(node['Uname']==sign):
                    return node
        return None

    #返回共同好友的id列表
    def commen_friend(self,id1,id2):
        idx1=id1-self.start_id
        idx2=id2-self.start_id
        flist1=[False for _ in range(self.vexnum) ]
        flist2= [False for _ in range(self.vexnum)]
        result=[]
        for fid in self.adj[idx1]:
            if fid!=id2:  #排除双方自己
                flist1[fid]=True
        for fid in self.adj[idx2]:
            if fid != id1:
                flist2[fid]=True
        for i in range(self.vexnum):
            if flist1[i] and flist2[i]:
                result.append(i+self.start_id)
        return result




#
def load_info():
	snw=Graph(58,3981)
	snw.give_node_data('..\\..\\static\\data\\3980.circles')
	snw.give_relations('..\\..\\static\\data\\3980.edges')
	return snw

# snw=load_info()
# # #snw.form_json_data('..\\..\\data\\jdata_.json')
# # print(snw.get_user_info("范俊"))
#
# # #
# list=snw.commen_friend(4000,3985)
# print(list)
