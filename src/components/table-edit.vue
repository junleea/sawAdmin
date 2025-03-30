<template>
	<el-form ref="formRef" :model="form" :rules="rules" :label-width="options.labelWidth">
		<el-row>
			<el-col :span="options.span" v-for="item in options.list">
				<el-form-item :label="item.label" :prop="item.prop">
					<!-- 文本框、数字框、下拉框、日期框、开关、上传 -->
					<el-input v-if="item.type === 'input'" v-model="form[item.prop]" :disabled="item.disabled"
						:placeholder="item.placeholder" clearable type="textarea" :row="item.rows?item.rows:1"></el-input>
					<el-input-number v-else-if="item.type === 'number'" v-model="form[item.prop]"
						:disabled="item.disabled" controls-position="right"></el-input-number>
					<el-select v-else-if="item.type === 'select'" v-model="form[item.prop]" :disabled="item.disabled"
						:placeholder="item.placeholder" clearable :multiple="item.multiple?true:false">
						<el-option v-for="opt in item.opts" :label="opt.label" :value="opt.value"></el-option>
					</el-select>
					<el-date-picker v-else-if="item.type === 'date'" type="date" v-model="form[item.prop]"
						:value-format="item.format"></el-date-picker>
					<el-switch v-else-if="item.type === 'switch'" v-model="form[item.prop]"
						:active-value="item.activeValue" :inactive-value="item.inactiveValue"
						:active-text="item.activeText" :inactive-text="item.inactiveText"></el-switch>
					<el-upload v-else-if="item.type === 'upload'" class="avatar-uploader" action="#"
						:show-file-list="false" :on-success="handleAvatarSuccess">
						<img v-if="form[item.prop]" :src="form[item.prop]" class="avatar" />
						<el-icon v-else class="avatar-uploader-icon">
							<Plus />
						</el-icon>
					</el-upload>
					<slot :name="item.prop" v-else>

					</slot>
				</el-form-item>
			</el-col>
		</el-row>

		<el-form-item>
			<el-button type="primary" @click="saveEdit(formRef)">保 存</el-button>
		</el-form-item>
	</el-form>
</template>

<script lang="ts" setup>
import { FormOption } from '@/types/form-option';
import { json } from 'd3';
import { FormInstance, FormRules, UploadProps } from 'element-plus';
import { PropType, ref } from 'vue';

const { options, formData, edit, update } = defineProps({
	options: {
		type: Object as PropType<FormOption>,
		required: true
	},
	formData: {
		type: Object,
		required: true
	},
	edit: {
		type: Boolean,
		required: false
	},
	update: {
		type: Function,
		required: true
	}
});


//const form = ref({ ...(edit ? formData : {}) });
const form = ref();

const doFormData = () => {
	let a={}
	let initialForm = { ...(edit ? formData : {}) };
	
	options.list.forEach(item => {
        if (item.type === 'select' && item.multiple) {
			let ids = formData[item.prop];
			let id_list = JSON.parse(ids);
			console.log(id_list);
			let selectedValues = [];
			for (let i = 0; i < id_list.length; i++) {
				selectedValues.push(id_list[i]["id"]);
			}
            if (!Array.isArray(initialForm[item.prop])) {
                initialForm[item.prop] = selectedValues;
            }
        }
    });
	return initialForm;
};
form.value=doFormData();

const rules: FormRules = options.list.map(item => {
	if (item.required) {
		return { [item.prop]: [{ required: true, message: `${item.label}不能为空`, trigger: 'blur' }] };
	}
	return {};
}).reduce((acc, cur) => ({ ...acc, ...cur }), {});


const formRef = ref<FormInstance>();
const saveEdit = (formEl: FormInstance | undefined) => {
	if (!formEl) return;
	formEl.validate(valid => {
		if (!valid) return false;
		update(form.value);
	});
};

const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
	form.value.thumb = URL.createObjectURL(uploadFile.raw!);
};

</script>

<style>
.avatar-uploader .el-upload {
	border: 1px dashed var(--el-border-color);
	border-radius: 6px;
	cursor: pointer;
	position: relative;
	overflow: hidden;
	transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
	border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
	font-size: 28px;
	color: #8c939d;
	width: 178px;
	height: 178px;
	text-align: center;
}
</style>
