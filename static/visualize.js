$(document).ready(function () {
    // 定义svg变量，选出第一个图
    var svg = d3.select("#svg1"),
        width = svg.attr('width'),
        height = svg.attr('height');
    var colors = ['#6ca46c', '#ca635f', '#4e88af', '#0A7373',
        '#B7BF99', '#EDAA25', '#C43302', '#3A37A6',
        '#BF1792', '#F2A81D', '#D96E11', '#F2B4AE',
        '#BF5A75', '#4A5B8C', '#557338', '#F26A4B', '#D98299'];


    var help = ['tips:',
        '1.如果没有出现节点和边的网状图形，请刷新',
        '2.鼠标悬停在任意节点上，不透明节点表示该用户的直接好友，半透明蓝色节点表示推荐好友，右侧为用户相关信息和推荐好友列表',
        '3.搜索框中两名输入用户id或名称，可显示两人的共同好友',
        '4.模式切换按钮可切换对节点的不同可视化表示，Circles为点，Texts为文字',
        '5.节点颜色表示用户所属的学校',
        '6.人际关系网络来自数据集<a href="https://socialnetworks.mpi-sws.org/data-imc2007.html" target="_blank">IMC 2007 Data Sets</a>，姓名为随机生成',
        '7.推荐值=共同好友数量*(1+0.4*共同学校)'


    ];
    $('#tips').append("<span>" + help[0] + "</span>")
    for (var i = 1; i < help.length; i++) {
        // 选中indicator，每一种都append一个div，就是前面的小色块
        $('#tips').append("<p>" + help[i] + "</p>")
    }

    // 定义D3的simulation是如何展示出来的
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.id;
        }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    // 存之后生成的关系图数据
    var graph;

    d3.json("..\\static\\data\\jdata_r.json", function (error, data) {
        if (error) throw error;

        graph = data;
        // console.log(graph)

        // D3数据驱动文档
        // 用links去驱动line的线宽
        var link = svg.append('g')
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter().append("line")
            .attr('stroke-width', function (d) {
                // return Math.sqrt(d.value);
                return 1;
            });

        // 添加所有的node
        var node = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(graph.nodes)
            .enter().append('circle')
            .attr("r", function (d) {
                return 10;
            })
            .attr('fill', function (d) { // 填充的颜色
                return colors[d.group];
            })
            .attr('stroke', 'none')    // 没有描边
            .attr('name', function (d) {
                return d.Uname;
            })
            .attr('id', function (d) { return d.id; })
            .call(d3.drag()             // 绑定d3的拖动函数
                .on("start", dragstarted) // 拖动开始
                .on("drag", dragged)      // 拖动进行
                .on("end", dragended));   // 拖动结束


        // 文本
        // 两种显示模式，每个结点可以用一个圆或者文本表示
        var text = svg.append('g')
            .attr("class", "texts")
            .selectAll("text")
            .data(graph.nodes)
            .enter().append("text")
            .attr("font-size", function (d) {
                return 12;
            })
            .attr("fill", function (d) {
                return colors[d.group];
            })
            .attr('name', function (d) {
                return d.Uname;
            })
            .attr('id', function (d) { return d.id; })
            .text(function (d) {
                return d.Uname;
            })

            .attr('text-anchor', 'middle')
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // 给node加title, 当鼠标悬浮在圆圈上的时候
        node.append('title').text(function (d) {
            return d.name;
        })

        // 处理缩放
        svg.call(d3.zoom()
            .scaleExtent([1 / 8, 8])
            .on("zoom", zoomed));

        function zoomed() {
            link.attr("transform", d3.event.transform);
            node.attr("transform", d3.event.transform);
            text.attr("transform", d3.event.transform);
            //linktext.attr('transform', d3.event.transform);
        }

        simulation
            .nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

        function ticked() {
            link
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            node
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                });

            text
                .attr("dx", function (d) {
                    return d.x;
                })
                .attr("dy", function (d) {
                    return d.y;
                });
        }
    })

    // 拖动事件函数
    var dragging = false;

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        dragging = true;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        dragging = false;
    }

    // 处理模式点击后的事件(这些元素页面上本来有)
    $('#mode span').click(function (event) {
        // 把mode里面所有span的active全部去掉
        // 把被点击的这个设置为active
        $('#mode span').removeClass('active')
        $(this).addClass('active')

        if ($(this).text() == 'Circles') {
            // 隐藏所有文本里面的svg元素
            // 把node里面的显示出来
            $('.texts text').hide();
            $('.nodes circle').show();
        }
        else {
            $('.texts text').show();
            $('.nodes circle').hide();
        }
    });

    // 处理事件：选中结点后只显示选中点及其直接相邻点
    // 这些元素原来没有，后面添加上去，所以写法和上面不同
    // 为#svg1中所有的 `.nodes circle` 元素，绑定了 `mouseenter`事件 
    $('#svg1').on('mouseenter', '.nodes circle', function (event) {
        // 拖动的时候，如果碰到别的结点，效果会发生变化，看起来很乱
        // 所以拖动的时候不允许触发鼠标进入事件
        if (!dragging) {
            var name = $(this).attr('id');
            var strname = $(this).attr('name')
            recommend_list = $(this).context.__data__.recommend;
            //console.log($(this).context.__data__.recommend);
            d3.select('#svg1 .nodes').selectAll('circle').attr('class', function (d) {
                // 是目前悬浮的那个
                if (d.id == name) {
                    return '';
                }
                for (let i = 0; i < recommend_list.length; i++) {
                    if (d.id == recommend_list[i]['id'])
                        return 'recommend';
                }
                // 不是悬浮的那个，需要显示相邻的circle，对其他的圆圈做处理
                // 遍历图中的所有link
                for (var i = 0; i < graph.links.length; i++) {
                    if (graph.links[i]['source'].id == name && graph.links[i]['target'].id == d.id) {
                        return '';
                    }
                    if (graph.links[i]['target'].id == name && graph.links[i]['source'].id == d.id) {
                        return '';
                    }
                }

                return 'inactive';

            });
            // 把info标题的颜色改为结点所属类别的颜色
            $('#info h2').css('color', $(this).attr('fill')).text(strname + "(" + name + ")");

            // 去掉旧的<p></p>
            $('#info p').remove();

            rank = 0;
            for (var i = 0; i < recommend_list.length; i++) {
                rcm = recommend_list[i];
                rcm_info = "" + (++rank) + ". " + rcm.Uname + "(" + rcm.id + ") 推荐值：" + rcm.recommended
                //console.log(rcm_info)
                $('#info').append('<p>' + rcm_info + '</p>');

            }
            if (recommend_list.length == 0) {
                $('#info').append('<p>' + '这个人的社交关系太少啦，找不到推荐好友T_T' + '</p>');
            }
            // 处理连接line,高亮相连的
            d3.select("#svg1 .links").selectAll('line').attr('class', function (d) {
                if (d.source.id == name || d.target.id == name) {
                    return 'heighlight';
                } else {
                    return '';
                }
            });
        }
    });
    // 处理鼠标移开的事件上
    $('#svg1').on('mouseleave', '.nodes circle', function (event) {
        if (!dragging) {
            // 否则，离开时把nodes和links的inactive去掉
            d3.select('#svg1 .nodes').selectAll('circle').attr('class', '');
            d3.select("#svg1 .links").selectAll('line').attr('class', '');
            d3.select('#svg1 .texts').selectAll('text').attr('class', '');
        }
    });

    $('#svg1').on('mouseenter', '.texts text', function (event) {

        if (!dragging) {
            var name = $(this).attr('id');
            var strname = $(this).attr('name')
            recommend_list = $(this).context.__data__.recommend;
            d3.select('#svg1 .texts').selectAll('text').attr('class', function (d) {
                // 是目前悬浮的那个
                if (d.id == name) {
                    return 'visible';
                }
                for (let i = 0; i < recommend_list.length; i++) {
                    //console.log(d.id)
                    if (d.id == recommend_list[i]['id'])
                        return 'recommend';
                }
                // 不是悬浮的那个，需要显示相邻的circle，对其他的圆圈做处理
                // 遍历图中的所有link
                for (var i = 0; i < graph.links.length; i++) {
                    if (graph.links[i]['source'].id == name && graph.links[i]['target'].id == d.id) {
                        return 'visible';
                    }
                    if (graph.links[i]['target'].id == name && graph.links[i]['source'].id == d.id) {
                        return 'visible';
                    }
                }
                return 'inactive'
            });
            // 把info标题的颜色改为结点所属类别的颜色
            $('#info h2').css('color', $(this).attr('fill')).text(strname + "(" + name + ")");

            // 去掉旧的<p></p>
            $('#info p').remove();
            rank = 0;

            for (var i = 0; i < recommend_list.length; i++) {
                rcm = recommend_list[i];
                rcm_info = "" + (++rank) + ". " + rcm.Uname + "(" + rcm.id + ") 推荐值：" + rcm.recommended

                $('#info').append('<p>' + rcm_info + '</p>');

            }
            if (recommend_list.length == 0) {
                $('#info').append('<p>' + '这个人的社交关系太少啦，找不到推荐好友T_T' + '</p>');
            }
            // 处理连接line,高亮相连的
            d3.select("#svg1 .links").selectAll('line').attr('class', function (d) {

                if (d.source.id == name || d.target.id == name) {
                    return 'heighlight';
                } else {
                    return '';
                }
            });
        }
    });

    $('#svg1').on('mouseleave', '.texts text', function (event) {
        if (!dragging) {

            d3.select('#svg1 .nodes').selectAll('circle').attr('class', '');
            d3.select("#svg1 .links").selectAll('line').attr('class', '');
            d3.select('#svg1 .texts').selectAll('text').attr('class', '');
        }
    });

    // 搜索功能

    $("#search_recommended").click(function () {
        //console.log($('#Uname1').val());
        //console.log($('#Uname2').val());
        $.get("/search_recommended", { "Uname1": $('#Uname1').val(), "Uname2": $('#Uname2').val() },
            function (data) {
                if (data) {

                    if (data.success == false) {
                        alert(data.info);

                        return;
                    }
                    else {
                        $('#info h2').css('color', 'darkred').text(data.user1.Uname + "(" + data.user1.id + ") &  " + data.user2.Uname + "(" + data.user2.id + ")");
                        // 去掉旧的<p></p>
                        $('#info p').remove();

                        $('#info').append('<p>' + data.info + '</p>');
                        //改变共同好友节点
                        friend_count = data['friends'].length;

                        d3.select("#svg1 .nodes").selectAll('circle').attr('class', function (d) {
                            if (d.id == data.user1.id || d.id == data.user2.id)
                                return '';
                            for (let j = 0; j < friend_count; j++) {
                                if (d.id == data['friends'][j])
                                    return 'commenfriend';

                            }
                            return 'inactive';
                        });

                        //d3.select('#svg1 .nodes').selectAll('circle').select('#' + data['friends'][i]).attr('class', 'commenfriend');
                    }
                }

            },
            "json"
        );
    })


});
