<template>
    <div>
        <el-row :gutter="20" class="mgb20">
            <el-col :span="6">
                <el-card shadow="hover" body-class="card-body">
                    <el-icon class="card-icon bg1">
                        <User />
                    </el-icon>
                    <div class="card-content">
                        <countup class="card-num color1" :end="baseInfo.user_count" />
                        <div>用户总量</div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" body-class="card-body">
                    <el-icon class="card-icon bg2">
                        <ChatDotRound />
                    </el-icon>
                    <div class="card-content">
                        <countup class="card-num color2" :end="baseInfo.message_count" />
                        <div>系统处理问答数</div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" body-class="card-body">
                    <el-icon class="card-icon bg3">
                        <ChatDotRound />
                    </el-icon>
                    <div class="card-content">
                        <countup class="card-num color3" :end="baseInfo.session_num" />
                        <div>系统总会话数</div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover" body-class="card-body">
                    <el-icon class="card-icon bg4">
                        <ChatDotRound />
                    </el-icon>
                    <div class="card-content">
                        <countup class="card-num color4" :end="baseInfo.today_message_count" />
                        <div>今日处理问答数</div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" class="mgb20">
            <el-col :span="18">
                <el-card shadow="hover">
                    <div class="card-header">
                        <p class="card-header-title">会话动态</p>
                        <p class="card-header-desc">最近一周会话动态，系统的处理会话数及消息数</p>
                    </div>
                    <v-chart class="chart" :option="dashOpt1_" />
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card shadow="hover">
                    <div class="card-header">
                        <p class="card-header-title">模型使用统计</p>
                        <p class="card-header-desc">模型使用统计情况</p>
                    </div>
                    <v-chart class="chart" :option="dashOpt2_" />
                </el-card>
            </el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="7">
                <el-card shadow="hover" :body-style="{ height: '400px' }">
                    <div class="card-header">
                        <p class="card-header-title">时间线</p>
                        <p class="card-header-desc">系统功能开发过程</p>
                    </div>
                    <el-timeline>
                        <el-timeline-item v-for="(activity, index) in activities" :key="index" :color="activity.color">
                            <div class="timeline-item">
                                <div>
                                    <p>{{ activity.content }}</p>
                                    <p class="timeline-desc">{{ activity.description }}</p>
                                </div>
                                <div class="timeline-time">{{ activity.timestamp }}</div>
                            </div>
                        </el-timeline-item>
                    </el-timeline>
                </el-card>
            </el-col>
            <el-col :span="10">
                <el-card :body-style="{ height: '400px' }" shadow="hover">
                    <template #header>
                        <div class="content-title">饼状图</div>
                    </template>
                    <v-chart class="schart" :option="pieOptions" />
                 </el-card>
            </el-col>
            <el-col :span="7">
                <el-card shadow="hover" :body-style="{ height: '400px' }">
                    <div class="card-header">
                        <p class="card-header-title">模型使用排行榜</p>
                        <p class="card-header-desc">热门模型使用排行榜</p>
                    </div>
                    <div>
                        <div class="rank-item" v-for="(rank, index) in ranks">
                            <div class="rank-item-avatar">{{ index + 1 }}</div>
                            <div class="rank-item-content">
                                <div class="rank-item-top">
                                    <div class="rank-item-title">{{ rank.title }}</div>
                                    <div class="rank-item-desc">使用量：{{ rank.value }}</div>
                                </div>
                                <el-progress
                                    :show-text="false"
                                    striped
                                    :stroke-width="10"
                                    :percentage="rank.percent"
                                    :color="rank.color"
                                />
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts" name="dashboard">
import { ref, reactive } from 'vue';
import countup from '@/components/countup.vue';
import { Function } from '@/types/function';
import { use, registerMap } from 'echarts/core';
import { BarChart, LineChart, PieChart, MapChart } from 'echarts/charts';
import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';
import { dashOpt1, dashOpt2, pieOptions } from './chart/options';
import chinaMap from '@/utils/china';
import {GetDashBoardStatisticsService} from '@/api/tool';
import {FindFunctionService} from "@/api/function";
use([
    CanvasRenderer,
    BarChart,
    GridComponent,
    LineChart,
    PieChart,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    VisualMapComponent,
    MapChart,
]);
const dashOpt2_ = reactive(dashOpt2);
const dashOpt1_ = reactive(dashOpt1);

//"dashboard_statistics_st": {
    // "session_num": 176,
    //         "message_count": 485,
    //         "user_count": 9625,
    //         "today_message_count": 10
    //     }
    // },

interface DashBoardBaseInfo {
    session_num: number;
    message_count: number;
    user_count: number;
    today_message_count: number;
}
const baseInfo = ref({} as DashBoardBaseInfo);

interface Activitie{
    content: string;
    description: string;
    timestamp: string;
    color: string;
}
const activities = ref<Activitie[]>([]);

interface Rank {
    title: string;
    value: number;
    percent: number;
    color: string;
}
const ranks = ref<Rank[]>([]);

const getDashBoardStatistics = async () => {
    let req = {
        token: localStorage.getItem('token'),
    };
    let result = await GetDashBoardStatisticsService(req);
    if (result['code'] === 0) {
        // console.log('dashboard:', result['data']);
        baseInfo.value = result['data']["dashboard_statistics_st"];
        dashOpt2_.series[0].data = result['data']["dashboard_statistics_model_st"];
        let max_model = Math.max(...result['data']["dashboard_statistics_model_st"].map((item: any) => item.value));
        ranks.value = result['data']["dashboard_statistics_model_st"].map((item: any) => {
            return {
                title: item.name,
                value: item.value,
                percent: (item.value / max_model*2) * 100,
                color: '#2d8cf0',
            };
        });
        ranks.value.sort((a, b) => b.value - a.value);
        //console.log('ranks:', ranks.value);
        // 处理数据
        //过去一周会话、消息数
        let sessionData = result['data']["dashboard_statistics_week"]["session_count"];
        let messageData = result['data']["dashboard_statistics_week"]["message_count"];
        let sessionCounts = sessionData.map((item: any) => item.count);
        let messageCounts = messageData.map((item: any) => item.count);
        dashOpt1_.series[0].data = sessionCounts;
        dashOpt1_.series[1].data = messageCounts;
    } else {
        console.error('获取统计数据失败:', result['msg']);
    }
    let function_result = await FindFunctionService(req);
    if (function_result['code'] === 0) {
        let functions: Function[] = function_result['data'];
        activities.value = functions.map((item: any) => {
            return {
                content: item.Name,
                description: item.Function,
                timestamp: item.CreatedAt,
                color: '#2d8cf0',
            };
        });
        activities.value.unshift({content: '基础管理功能',description: '系统基础管理功能开发',timestamp: "2024-03-23 12:21:42",color: '#2d8cf0'});
        activities.value.push({content: '数据统计功能',description: '系统数据统计功能开发',timestamp: "2024-03-23 12:21:42",color: '#2d8cf0'});
    } else {
        console.error('获取统计数据失败:', function_result['msg']);
    }
};
getDashBoardStatistics();
</script>

<style>
.card-body {
    display: flex;
    align-items: center;
    height: 100px;
    padding: 0;
}
</style>
<style scoped>
.card-content {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: #999;
    padding: 0 20px;
}

.card-num {
    font-size: 30px;
}

.card-icon {
    font-size: 50px;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
    color: #fff;
}

.bg1 {
    background: #2d8cf0;
}

.bg2 {
    background: #64d572;
}

.bg3 {
    background: #f25e43;
}

.bg4 {
    background: #e9a745;
}

.color1 {
    color: #2d8cf0;
}

.color2 {
    color: #64d572;
}

.color3 {
    color: #f25e43;
}

.color4 {
    color: #e9a745;
}

.chart {
    width: 100%;
    height: 400px;
}

.card-header {
    padding-left: 10px;
    margin-bottom: 20px;
}

.card-header-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
}

.card-header-desc {
    font-size: 14px;
    color: #999;
}

.timeline-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    color: #000;
}

.timeline-time,
.timeline-desc {
    font-size: 12px;
    color: #787878;
}

.rank-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.rank-item-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f2f2f2;
    text-align: center;
    line-height: 40px;
    margin-right: 10px;
}

.rank-item-content {
    flex: 1;
}

.rank-item-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #343434;
    margin-bottom: 10px;
}

.rank-item-desc {
    font-size: 14px;
    color: #999;
}
.map-chart {
    width: 100%;
    height: 350px;
}
.content-title {
    font-weight: 400;
    font-size: 22px;
    color: #1f2f3d;
}
</style>
