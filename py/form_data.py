import codecs
import json
import re
import pandas
from faker import Faker

relations=pandas.DataFrame(pandas.read_csv('../static/data\\3980.edges', sep=' ', names=['A', 'B']))
#print(relations.info())
#print(relations.loc[0,'A'])
#处理边
links=[]
for i in range (len(relations)):
    links.append(dict(source=int(relations.loc[i,'A']),target=int(relations.loc[i,'B']),relation='friend'))
#处理节点
nodes=[]
for j in range (3981,4039):
    name = Faker('zh_CN').name()
    #print(name)
    nodes.append(dict(id=j,Uname=name))
circle_path= '../static/data\\3980.circles'

with open(circle_path,'r') as file1:
    circles=file1.readlines()
    idx=0
    for circle in circles:

        members=re.split('[ |\t]',circle.split('\n')[0])
        print(members)
        for i in range (1,len(members)):
            nodes[int(members[i])-3981]['group']=idx
        idx+=1


filepath = '../static/data\jdata.json'
file = codecs.open(filepath,  'w','utf-8')
json.dump(dict(links=links,nodes=nodes), file, ensure_ascii=False,indent=1)

