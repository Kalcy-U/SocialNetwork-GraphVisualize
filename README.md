## 人际关系网络可视化及好友推荐系统

![homepage](https://raw.github.com/Kalcy-U/master/SocialNetwork-GraphVisualize/img/image-20220828185359762.png)

![demo](https://raw.github.com/Kalcy-U/master/SocialNetwork-GraphVisualize/img/image-20220828174830668.png)

#### 说明

1. 如果没有出现节点和边的网状图形，请刷新

2. 鼠标悬停在任意节点上，不透明节点表示该用户的直接好友，半透明蓝色节点表示推荐好友，右侧为用户相关信息和推荐好友列表

3. 搜索框中两名输入用户id或名称，可显示两人的共同好友

4. 模式切换按钮可切换对节点的不同可视化表示，Circles为点，Texts为文字

5. 节点颜色表示用户所属的学校

6. 人际关系网络来自数据集

[IMC 2007 Data Sets]: https://socialnetworks.mpi-sws.org/data-imc2007.html

 姓名为随机生成

7. 推荐值 = 共同好友数量 * (1+0.4 * 共同学校)

#### 运行

方法1：直接打开index_min.html。建议使用chrome浏览器。部分功能受限。

方法2:  部署后端。安装python依赖库，运行main.py。

