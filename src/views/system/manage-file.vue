<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" :refresh="getData" />
        <div class="container">
            <TableCustom :columns="columns" :tableData="tableData" :total="page.total" :viewFunc="handleView"
                :delFunc="handleDelete" :page-change="changePage" :editFunc="handleEdit" :genOperate="handleGenOperate" :refresh="getData">
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="visible_add = true" v-if="userRole">上传文件</el-button>
                </template>
            </TableCustom>

        </div>
        <el-dialog :title="isEdit ? '编辑': '编辑'" v-model="visible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options_edit" :edit="isEdit" :update="updateData" />
        </el-dialog>
        <el-dialog :title="isAdd ? '上传' : '上传'" v-model="visible_add" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
           <UploadFile></UploadFile>
        </el-dialog>
        <el-dialog title="查看详情" v-model="visible1" width="700px" destroy-on-close>
            <TableDetail :data="viewData"></TableDetail>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="system-user">
import { ref, reactive } from 'vue';
import { ElMessage,ElMessageBox } from 'element-plus';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import { Session } from '@/types/session';
import {FindUserFileService} from "@/api/file";
import {UpdateUserFileService} from "@/api/file";
import {DelUserFileService} from "@/api/file";
import { File,fileUrl } from '@/types/file';
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import UploadFile from '@/components/upload-file.vue';
import { FormOption, FormOptionList } from '@/types/form-option';

const userRole = ref(localStorage.getItem('role') == 'admin');
const page = reactive({
    index: 1,
    size: 10,
    total: 122,
})
const tableData = ref<File[]>([]);

// 查询相关
const query = reactive({
    name: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '文件名：', prop: 'name' }
])
const handleSearch = async () => {
    // if (isFinite(query.name) == false){
    //     ElMessage.error("请输入正确的会话ID");
    //     return;
    // }
    let req={
        token: localStorage.getItem('token'),
        type: "search",
        file_name: query.name,
    }
    if (!req.file_name) {
        ElMessage.error("请求参数不能为空");
        return;
    }
    let result = await FindUserFileService(req);
    tableData.value = result.data;
    page.total = result.data.length;
};

// 表格相关
let columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'ID', label: '文件ID', width: 50 },
    { prop: 'UserFileName', label: '文件名' ,width: 300},
    { prop: "UploadType", label: "上传类型",width: 100},
    { prop: 'CreatedAt', label: '创建时间',type: 'date',width: 200 },
    { prop: 'UpdatedAt', label: '更新时间',type: 'date',width: 200 },
    { prop: 'operator', label: '操作' , operate: { view: false, edit: true, delete: true,push: {link: false,label:"继续该会话"} ,gen: {show: true,label:"下载文件"}},
         align: 'center', fixed: 'right' },
])

const getData = async () => {
    let req={
        token: localStorage.getItem('token'),
        type: "all"
    }
    let result = await FindUserFileService(req);
    tableData.value = result.data;
    page.total = result.data.length;
};
getData();

const changePage = (val: number) => {
    page.index = val;
    getData();
};

// 新增弹窗
let options = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'input', label: '文件名称', prop: 'UserFileName', required: true },
    ]
})

//编辑弹窗
let options_edit = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'input', label: '文件名称', prop: 'UserFileName', required: true },
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
            file_id: data.ID,
            file_name: data.UserFileName,
        };
        console.log("update row data:", req);
        //检查请求参数
        if (!req.file_name) {
            ElMessage.error("请求参数错误");
            return;
        }
        result = await UpdateUserFileService(req)
        if (result["code"] === 0) {
          ElMessage.success("更新成功");
        } else {
          ElMessage.error("更新失败");
        }

      }catch(e){
        console.log(e);
      }
      closeDialog();
    getData();
};

const addData = async (data) => {
    let result ={}
      try{
        let req={
            token:localStorage.getItem("token"),
            name: data.Name
        };
        //result = await AddSessionService(req)
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
const handleView =async (row: File) => {
    viewData.value.row = row;
    viewData.value.list = [
        
    ]
    visible1.value = true;
};

const handleGenOperate = async (row: File) => {
    console.log("gen row:", row);
    //弹出提示框
    ElMessageBox.confirm('确定要下载吗？', '提示', {
        type: 'warning'
    })
        .then(async () => {
            // 处理下载逻辑
            downloadFile(row);
        })
        .catch(() => { });
    
}
const downloadFile = async (row: File) => {
    const fileUrl_ = fileUrl+row.file_store_name;
    const response = await fetch(fileUrl_)
    const blob = await response.blob()
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = row.UserFileName // 设置下载的文件名
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    // 释放内存
    window.URL.revokeObjectURL(url)
    ElMessage.success('文件下载成功')
};
// 删除相关
const handleDelete = async (row: File) => {
    let req={
        token: localStorage.getItem('token'),
        id: row.ID,
    }
    try{
        let result = await DelUserFileService(req);
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