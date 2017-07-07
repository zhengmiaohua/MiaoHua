//跨域中转
var urlPre = "http://crossorigin.me/http://";
//通过发车站和到达站查询火车时刻表
var url1 = "ws.webxml.com.cn/WebServices/TrainTimeWebService.asmx/getStationAndTimeByStationName?UserID=";
//通过火车车次查询本火车时刻表
var url2 = "ws.webxml.com.cn/WebServices/TrainTimeWebService.asmx/getStationAndTimeDataSetByLikeTrainCode?UserID=";
//通过火车车次查询列车经由车站明细
var url3 = "ws.webxml.com.cn/WebServices/TrainTimeWebService.asmx/getDetailInfoByTrainCode?UserID=";

//获取车次列表
var getTrainList=function(){
    if($("#trainNum").val() || ($("#startStation").val() && $("#endStation").val())){
        var searchButton=$(this);
        $("#search-submit").attr("disabled","true");
        var list=$("#list");
        $.mobile.loading("show");
        var _data={};
        var _url=url1;

        if(!$("#trainNum").val()){
            _data.StartStation=$("#startStation").val();
            _data.ArriveStation=$("#endStation").val();
        }else{
            _data.TrainCode=$("#trainNum").val();
            _url=url2;
        }

        $.get(urlPre + _url, _data, function(data){
            list.html("");
            var timeTables=$(data).find("TimeTable");
            var _arr=[];
            timeTables.each(function(index,item){
                if(index>10) return false;
                var that=$(this);
                if(that.find("FirstStation").text()==="数据没有被发现"){
                    $( "#myPopupSecendDiv" ).popup("open");
                    return false;
                }

                var _html='<li><a href="#" data-no="' + that.find("TrainCode").text() + '">' +
                        '<h2>' + that.find("TrainCode").text() + '次</h2>' +
                        '<p>' + that.find("FirstStation").text() + ' → ' + that.find("LastStation").text() + '</p>' +
                        '<p>用时：' + that.find("UseDate").text() + '</p>' +
                        '<p class="ui-li-aside">' + that.find("StartTime").text() + ' 开</p>' +
                        '</a></li>';
                _arr.push(_html);
            });
            if(_arr.length>0){
                list.html(_arr.join(""));
                list.listview("refresh");
            }

            $.mobile.loading("hide");
            searchButton.attr("disabled",false);
        });

    } else {
        //alert("请输入发车站和终点站，或者车次");
        $( "#myPopupFirstDiv" ).popup("open");
    }
}
//获取车次详细信息
var isAjax=false;//是否正在获取车次详细信息
var getInfoByTrainCode=function(){
    $.mobile.loading("show");
    if(isAjax) return;
    isAjax=true;
    var trainCode=$(this).attr("data-no");
    $.get(urlPre + url3, {TrainCode: trainCode},function(data){
        $("#detail").find(".ui-content h2").first().html(trainCode + "次");
        var tbody=$("#detail").find(".ui-content tbody");
        tbody.html("");

        $(data).find("TrainDetailInfo").each(function(index,item){
            var tr=$("<tr></tr>");
            var that=$(this);
            var stopTime="";
            var startTime=that.find("StartTime").text();
            var arriveTime=that.find("ArriveTime").text();
            if(startTime&&arriveTime){
                stopTime=(new Date('2017-01-01'+' '+startTime)-new Date('2017-01-01'+' '+arriveTime))/1000/60+'分';
            }
            if(!startTime){
                startTime='--';
            }
            if(!arriveTime){
                arriveTime='--';
            }
            var _html='<td>' + that.find("TrainStation").text() + '</td>' + '<td>' + arriveTime + '</td>' + '<td>' + startTime + '</td>' + '<td>' + stopTime + '</td>';
            tr.html(_html);
            tbody.append(tr);
        });
        $.mobile.loading("hide");
        isAjax=false;
        $.mobile.changePage("#detail");
    });
};

var bindEvent=function(){
    $("#search-submit").on("click",getTrainList);
    //为list每个a标签绑定事件
    $("#list").on("click","a",getInfoByTrainCode);
};
//页面载入时初始化
$(document).on("pageinit","#index",function(){
    bindEvent();
});