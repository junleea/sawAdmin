<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" :refresh="getData" />
        <div class="container">
            <TableCustom :columns="columns" :tableData="tableData" :total="page.total" :viewFunc="handleView"
                :delFunc="handleDelete" :page-change="changePage" :editFunc="handleEdit" :genOperate="handleGenOperate" :refresh="getData">
                <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="visible_add = true">新增</el-button>
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
import { FindUserFileService } from "@/api/file";
import { KBase } from '@/types/kbase';
import {FindKnowledgeBaseService} from "@/api/kbase";
import {UpdateKnowledgeBaseService} from "@/api/kbase";
import {AddKnowledgeBaseService} from "@/api/kbase";
import {DelKnowledgeBaseService} from "@/api/kbase";
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import { FormOption, FormOptionList } from '@/types/form-option';


// 查询相关
const query = reactive({
    name: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '模型ID：', prop: 'name' }
])
const handleSearch = async () => {
    // query.name是否是数字
    if (isNaN(Number(query.name))) {
        ElMessage.error('请输入数字');
        return;
    }
    if (query.name === '') {
        ElMessage.error('请输入模型ID');
        return;
    }
    let req={
        token: localStorage.getItem('token'),
        type: "ID",
        id: parseInt(query.name)
    }
    let result = await FindKnowledgeBaseService(req);
    tableData.value = result.data;
    page.total = result.data.length;
};

// 表格相关
let columns = ref([
  //  { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'ID', label: '知识库ID' },
    { prop: "Name", label: "知识库名称" },
    {prop: 'Description', label: '描述'},
    { prop: 'FileNameList', label:"知识库文件", width: 300},
    { prop: 'CreatedAt', label: '创建时间',type: 'date' },
    { prop: 'UpdatedAt', label: '上次更新时间', type: 'date'},
    { prop: 'operator', label: '操作', width: 250 , operate: { view: true, edit: true, delete: true,push: {link: false,label:"继续该会话"},gen: {show: false,label:"下载文件"} }},
])
const page = reactive({
    index: 1,
    size: 10,
    total: 122,
})
const tableData = ref<KBase[]>([]);
const file_ids_select_opts = ref([]);
const getData = async () => {
    let req={
        token: localStorage.getItem('token'),
        type: "UserID"
    }
    let result = await FindKnowledgeBaseService(req);
    let req2 = {
        token: localStorage.getItem("token"),
        type: "all",
    }
    let fileResult = await FindUserFileService(req2);
    file_ids_select_opts.value.length = 0; // 清空数组
    for (let i = 0; i < fileResult.data.length; i++) {
        let userFile = fileResult.data[i];
        file_ids_select_opts.value.push({
            label: userFile.UserFileName,
            value: userFile.ID
        })
    }
    tableData.value = result.data;
    //将文件id与对应文件对应的文件名拼接成字符串
    for (let i = 0; i < tableData.value.length; i++) {
        let file_ids = JSON.parse(tableData.value[i].FileIDs.toString())
        let file_id_list = []
        for (let j = 0; j < file_ids.length; j++) {
            file_id_list.push(file_ids[j]["file_id"])
        }
        let file_name_list = []
        //fileResult.data是文件列表
        for (let k = 0; k < fileResult.data.length; k++) {
            let userFile = fileResult.data[k];
            for (let l = 0; l < file_id_list.length; l++) {
                if (userFile.ID == file_id_list[l]) {
                    file_name_list.push(userFile.UserFileName)
                }
            }
        }
        tableData.value[i].FileNameList = file_name_list.join(",")
        // console.log("file_name_list:", file_name_list)
    }
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
        { type: 'input', label: '名称', prop: 'Name', required: true },
        { type: 'select', label: '文件', prop: 'FileIDs', required: true, opts:file_ids_select_opts.value ,multiple: true},
        { type: 'input', label: '描述', prop: 'Description', required: true },
    ]
})

//编辑弹窗
let options_edit = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        { type: 'input', label: '名称', prop: 'Name', required: true },
        { type: 'select', label: '文件', prop: 'FileIDs', required: true, opts:file_ids_select_opts.value ,multiple: true},
        { type: 'input', label: '描述', prop: 'Description', required: true },
    ]
})

const visible = ref(false);
const visible_add = ref(false);
const isEdit = ref(false);
const isAdd = ref(false);
const rowData = ref({});
const handleEdit = async (row: KBase) => {
    let data = row;
    rowData.value = data;
    if(typeof data.FileIDs === "string"){
        console.log("edit_row_data:", rowData.value);
        let file_ids = JSON.parse(data.FileIDs.toString())
        let file_id_list = []
        for (let i = 0; i < file_ids.length; i++) {
            file_id_list.push(file_ids[i]["file_id"])
        }
        console.log("file_id_list:", file_id_list)
        rowData.value.FileIDs = file_id_list;
    }
    isEdit.value = true;
    visible.value = true;
};
const updateData = async (data) => {
    let file_id =[]
    console.log("file update:",data)
    let file_id_list= data["FileIDs"]
    for (let i = 0; i < file_id_list.length; i++) {
        file_id.push({"file_id":file_id_list[i]})
    }
    let file_ids = JSON.stringify(file_id)
    let result ={}
      try{
        let req={
            token:localStorage.getItem("token"),
            id: data.ID,
            name: data.Name,
            description: data.Description,
            file_ids: file_ids,
        };
        result = await UpdateKnowledgeBaseService(req)
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
    let file_id =[]
    console.log("file add:",data)
    let file_id_list= data["FileIDs"]
    for (let i = 0; i < file_id_list.length; i++) {
        file_id.push({"file_id":file_id_list[i]})
    }
    let file_ids = JSON.stringify(file_id)
    let result ={}
      try{
        let req={
            token:localStorage.getItem("token"),
            name: data.Name,
            description: data.Description,
            file_ids: file_ids,
        };
        console.log("add row data:", req);
        result = await AddKnowledgeBaseService(req)
        if (result["code"] === 0) {
          ElMessage.success("新增成功");
        } else {
          ElMessage.error("新增失败");
        }

      }catch(e){
        console.log(e);
      }
    closeDialog();
    getData();
};


const closeDialog = () => {
    visible.value = false;
    visible_add.value = false;
    isEdit.value = false;
};

const handleGenOperate = async (row: File) => {
    console.log("gen row:", row);
}

// 查看详情弹窗相关
const visible1 = ref(false);
const viewData = ref({
    row: {},
    list: [

    ]
});
const handleView =async (row: KBase) => {
    viewData.value.row = row;
    viewData.value.list = [
        {
            prop: 'ID',
            label: '知识库ID',
        },
        {
            prop: 'Name',
            label: '知识库名称',
        },
        {
            prop: 'FileNameList',
            label: '知识库文件',
        },
        {
            prop: 'Description',
            label: '描述',
        },
        {
            prop: 'CreatedAt',
            label: '创建时间',
            type: 'date'
        },
        {
            prop: 'UpdatedAt',
            label: '更新时间',
            type: 'date'
        },
    ]
    visible1.value = true;
};

// 删除相关
const handleDelete = async (row: KBase) => {
    let req={
        token: localStorage.getItem('token'),
        id: row.ID,
    }
    try{
        let result = await DelKnowledgeBaseService(req);
        if(result["code"] === 0){
            ElMessage.success("删除成功");
            getData();
        }else{
            ElMessage.error("删除失败");
        }
    }catch(e){
        console.log(e);
    }
}
</script>

<style scoped></style>