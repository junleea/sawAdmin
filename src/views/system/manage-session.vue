<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" :refresh="getData" />
        <div class="container">
            <TableCustom :columns="columns" :tableData="tableData" :total="page.total" :viewFunc="handleView"
                :delFunc="handleDelete" :page-change="changePage" :editFunc="handleEdit" :genOperate="handleGenOperate" :refresh="getData">
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="visible_add = true" v-if="userRole">新增</el-button>
                </template>
            </TableCustom>

        </div>
        <el-dialog :title="isEdit ? '编辑': '编辑'" v-model="visible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options_edit" :edit="isEdit" :update="updateData" />
        </el-dialog>
        <el-dialog :title="isAdd ? '新增' : '新增'" v-model="visible_add" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options" :edit="isAdd" :update="addData" />
        </el-dialog>
        <el-dialog title="查看详情" v-model="visible1" width="700px" destroy-on-close>
            <TableDetail :data="viewData"></TableDetail>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-user">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import { UserInfo } from '@/types/user';
import { Session } from '@/types/session';
import { fetchUserData } from '@/api';
import { SearchUserService } from "@/api/user";
import {FindSessionService} from "@/api/session";
import {UpdateSessionService} from "@/api/session";
import {AddSessionService} from "@/api/session";
import {DelSessionService} from "@/api/session";
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import { FormOption, FormOptionList } from '@/types/form-option';

const userRole = localStorage.getItem('role') == 'admin';
const page = reactive({
    index: 1,
    size: 10,
    total: 122,
})
const tableData = ref<Session[]>([]);

// 查询相关
const query = reactive({
    name: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '会话ID：', prop: 'name' }
])
const handleSearch = async () => {
    // if (isFinite(query.name) == false){
    //     ElMessage.error("请输入正确的会话ID");
    //     return;
    // }
    let req={
        token: localStorage.getItem('token'),
        type: "ID",
        id: parseInt(query.name)
    }
    let result = await FindSessionService(req);
    tableData.value = result.data;
    page.total = result.data.length;
};

// 表格相关
let columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'ID', label: '会话ID', width: 50 },
    { prop: 'Name', label: '会话名' ,width: 300},
    { prop: 'MsgCount', label: '消息数',width:50},
    { prop: "Context", label: "会话背景参数" ,width: 100},
    { prop: 'CreatedAt', label: '创建时间',type: 'date',width: 150 },
    { prop: 'UpdatedAt', label: '更新时间',type: 'date',width: 150 },
    { prop: 'operator', label: '操作' , operate: { view: false, edit: true, delete: true,push: {link: true,label:"继续该会话"},gen: {show: false,label:"下载文件"}}},
])

const getData = async () => {
    let req={
        token: localStorage.getItem('token'),
        type: "UserID"
    }
    let result = await FindSessionService(req);
    tableData.value = result.data;
    page.total = result.data.length;
};
getData();

const changePage = (val: number) => {
    page.index = val;
    getData();
};

const handleGenOperate = async (row: File) => {
    console.log("gen row:", row);
}

// 新增弹窗
let options = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'input', label: '会话名称', prop: 'Name', required: true },
    ]
})

//编辑弹窗
let options_edit = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'input', label: '会话名称', prop: 'Name', required: true },
    ]
})

const visible = ref(false);
const visible_add = ref(false);
const isEdit = ref(false);
const isAdd = ref(false);
const rowData = ref({});
const handleEdit = async (row: Session) => {
    let data = row;
    rowData.value = data;
    console.log("edit_row_data:", rowData.value);
    isEdit.value = true;
    visible.value = true;
};
const updateData = async (data) => {
    let result ={}
      try{
        let req={
            token:localStorage.getItem("token"),
            id: data.ID,
            name: data.Name
        };
        result = await UpdateSessionService(req)
        if (result["code"] === 0) {
          ElMessage.success("更新成功");
        } else {
          ElMessage.error("更新失败");
        }

      }catch(e){
        console.log(e);
      }
      closeDialog();
    handleSearch();
};

const addData = async (data) => {
    let result ={}
      try{
        let req={
            token:localStorage.getItem("token"),
            name: data.Name
        };
        result = await AddSessionService(req)
        if (result["code"] === 0) {
          ElMessage.success("新增成功");
        } else {
          ElMessage.error("新增失败");
        }

      }catch(e){
        console.log(e);
      }
    closeDialog();
    handleSearch();
};


const closeDialog = () => {
    visible.value = false;
    visible_add.value = false;
    isEdit.value = false;
};

// 查看详情弹窗相关
const visible1 = ref(false);
const viewData = ref({
    row: {},
    list: []
});
const handleView =async (row: Session) => {
    viewData.value.row = row;
    viewData.value.list = [
        
    ]
    visible1.value = true;
};

// 删除相关
const handleDelete = async (row: Session) => {
    let req={
        token: localStorage.getItem('token'),
        id: row.ID,
    }
    try{
        let result = await DelSessionService(req);
        if(result["code"] === 0){
            ElMessage.success("删除成功");
            handleSearch();
        }else{
            ElMessage.error("删除失败");
        }
    }catch(e){
        console.log(e);
    }
}
</script>

<style scoped></style>