<template>
    <div>
        <TableSearch :query="query" :options="searchOpt" :search="handleSearch" :refresh="getData" />
        <div class="container">
            <TableCustom :columns="columns" :tableData="tableData" :total="page.total" :viewFunc="handleView"
                :delFunc="handleDelete" :page-change="changePage" :editFunc="handleEdit">
                <!-- <template #toolbarBtn>
                    <el-button type="warning" :icon="CirclePlusFilled" @click="visible_add = true">新增</el-button>
                </template> -->
            </TableCustom>

        </div>
        <el-dialog :title="isEdit ? '编辑': '编辑'" v-model="visible" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options_edit" :edit="isEdit" :update="updateData" />
        </el-dialog>
        <!-- <el-dialog :title="isAdd ? '新增' : '新增'" v-model="visible_add" width="700px" destroy-on-close
            :close-on-click-modal="false" @close="closeDialog">
            <TableEdit :form-data="rowData" :options="options" :edit="isAdd" :update="addData" />
        </el-dialog> -->
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
import { fetchUserData } from '@/api';
import { SearchUserService } from "@/api/user";
import {GetUserInfoService} from "@/api/user";
import {updateUserInfoService} from "@/api/user";
import TableCustom from '@/components/table-custom.vue';
import TableDetail from '@/components/table-detail.vue';
import TableSearch from '@/components/table-search.vue';
import { FormOption, FormOptionList } from '@/types/form-option';

// 查询相关
const query = reactive({
    name: '',
});
const searchOpt = ref<FormOptionList[]>([
    { type: 'input', label: '用户名或ID：', prop: 'name' }
])
const handleSearch = async () => {
    let search_id= -1;
    let keyword_ = "";
    try{
        search_id = parseInt(query.name);
    }catch(e){
        search_id = -1;
        keyword_ = query.name;
    }
    let req={
        token: localStorage.getItem('token'),
        id: search_id,
        keyword: keyword_,
    }
    let result = await SearchUserService(req);
    tableData.value = result.data;
    page.total = result.data.length;
};

// 表格相关
let columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'ID', label: '用户ID' },
    { prop: 'Name', label: '用户名' },
    { prop: 'Age', label: '年龄'},
    { prop: 'Role', label: '角色' },
    { prop: 'CreatedAt', label: '创建时间',type: 'date' },
    { prop: 'Email', label: '邮箱' },
    { prop: 'operator', label: '操作', width: 250 ,operate: { view: true, edit: true, delete: true ,push: {link: false,label:"继续该会话"},gen: {show: false,label:"下载文件"}}},
])
const page = reactive({
    index: 1,
    size: 10,
    total: 122,
})
const tableData = ref<UserInfo[]>([]);
const getData = async () => {
    let req={
        token: localStorage.getItem('token'),
        id: -1,
        keyword: "_121",
    }
    let result = await SearchUserService(req);
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
        { type: 'input', label: '用户名', prop: 'Name', required: true },
        { type: 'input', label: '密码', prop: 'Password', required: true },
        { type: 'input', label: '邮箱', prop: 'Email', required: true },
        { type: 'input', label: '角色', prop: 'Role', required: true },
    ]
})

//编辑弹窗
let options_edit = ref<FormOption>({
    labelWidth: '100px',
    span: 12,
    list: [
        {prop: 'Avatar',label: '头像', type: 'input', required: false},
        { type: 'input', label: '用户名', prop: 'Name', required: true },
        { type: 'input', label: '年龄', prop: 'Age', required: false },
        { type: 'input', label: '密码', prop: 'Password', required: false },
        { type: 'input', label: '邮箱', prop: 'Email', required: true },
        { type: 'select', label: '性别', prop: 'Gender', required: false,opts:[{label: '男', value:"男"},{label: '女', value:"女"}]},
        //select 选择框,可选择admin与user两种角色
        { type: 'select', label: '角色', prop: 'Role', opts: [{label:"管理员",value:"admin"},{label:"普通用户",value:"user"}],required: false },

    ]
})

const visible = ref(false);
const visible_add = ref(false);
const isEdit = ref(false);
const isAdd = ref(false);
const rowData = ref({});
const handleEdit = async (row: UserInfo) => {
    let data = await getUserInfo(row.ID);

    rowData.value = data;
    isEdit.value = true;
    visible.value = true;
};
const updateData = async (data) => {
    let result ={}
      try{
        let req={
            token:localStorage.getItem("token"),
            id: data.ID,
            name: data.Name,
            age: data.Age,
            gender: data.Gender,
            password: data.Password,
            email: data.Email,
            avatar: data.Avatar,
            role: data.Role,
        };

        result = await updateUserInfoService(req)
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

const getUserInfo = async (id) => {
      let result = {};
      try{
        //获取用户信息
        let req={
            token: localStorage.getItem('token'),
            id: id,
        };
        result = await GetUserInfoService(req)
        if(result['code'] === 0){
          return result['data'];
        }
      }catch(e){
        console.log(e);
      }
      return {};
    }

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
const handleView =async (row: UserInfo) => {
    let data = await getUserInfo(row.ID);
    viewData.value.row = data;
    viewData.value.list = [
        {
            prop: 'Avatar',
            label: '头像', //显示头像
            type: 'image',
            width: 100,
        },
        {
            prop: 'ID',
            label: '用户ID',
        },
        {
            prop: 'Name',
            label: '用户名',
        },
        {
            prop: 'Email',
            label: '邮箱',
        },
        {
            prop: 'Gender',
            label: '性别',
        },
        {
            prop: 'Role',
            label: '角色',
        },
        {
            prop: 'CreatedAt',
            label: '注册日期',
            type: 'date',
        },
    ]
    visible1.value = true;
};

// 删除相关
const handleDelete = (row: UserInfo) => {
    ElMessage.success('删除成功');
}
</script>

<style scoped></style>