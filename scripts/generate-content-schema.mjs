import {writeFileSync} from 'node:fs';
const text={type:'string',minLength:1,maxLength:20000},id={type:'string',pattern:'^[a-z][a-z0-9-]{0,79}$'},num={type:'integer',minimum:1,maximum:1000000};
const list=(items,minItems=0)=>({type:'array',items,minItems,maxItems:5000});
const ids={...list(id),uniqueItems:true};
const url={type:'string',pattern:'^https://[^\\s]+$',maxLength:2000};
const sessions={type:'array',items:num,minItems:2,maxItems:2};
const object=(properties,required=Object.keys(properties))=>({type:'object',properties,required,additionalProperties:false});
const lesson=object({id,chapter:num,order:num,title:text,category:{enum:['Technika','Rytm','Teoria','Słuch','Repertuar','Improwizacja']},theory:text,steps:list(text,1),example:text,criteria:list(text,1),mistake:text,source:id,prerequisites:ids,optional:{type:'boolean'},challenge:{type:'boolean'},minutes:{type:'integer',minimum:1,maximum:180},sessions,branch:text,songChoices:{...ids,minItems:1,maxItems:10}},['id','chapter','order','title','category','theory','steps','example','criteria','mistake','source','prerequisites','optional','challenge','minutes']);
const song=object({id,title:text,artist:text,kind:{enum:['Piosenka','Riff','Aranżacja']},chapter:num,version:text,requirements:ids,example:{type:'string',maxLength:20000},url,lesson:id,teacher:text,language:text,practice:list(text,1),criteria:list(text,1),nylon:text,sessions,checkpoint:num,extraUrl:url},['id','title','artist','kind','chapter','version','requirements','example']);
const schema=object({schemaVersion:{const:1},chapters:{...list(object({id:{type:'integer',minimum:1,maximum:30},title:text,subtitle:text,region:text}),1),maxItems:30},lessons:list(lesson,1),songs:list(song),sources:{type:'object',minProperties:1,maxProperties:5000,propertyNames:id,additionalProperties:object({title:text,url,language:text,access:text})}});
writeFileSync('src/content/schema.json',JSON.stringify(schema,null,2)+'\n');

const draft=JSON.parse(JSON.stringify(schema,(key,value)=>key==='minLength'?0:value));
writeFileSync('src/content/draft-schema.json',JSON.stringify(draft,null,2)+'\n');
