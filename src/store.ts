import { readFilePromise,writeFilePromise } from "./util";

class Store {
    cookies:{name:string,value:string,username:string,expires:string}[]=[];
    destroy(index:number){
        this.cookies.splice(index,1);
        return writeFilePromise(__dirname+"/session.json",JSON.stringify(this.cookies))
    }
    async isValid(name:string,value:any,username:string){
        if(!this.cookies.length) this.cookies=JSON.parse(await readFilePromise(__dirname+"/session.json","utf-8")||"[]");
        return !!this.cookies?.find(cookie=>cookie.username==username && cookie.name==name && cookie.value==value && cookie.expires>new Date().toISOString())
    }
    async get(value:string){
        let cookie,foundIndex:number=-1;
        if(!this.cookies.length){
            this.cookies=JSON.parse(await readFilePromise(__dirname+"/session.json","utf-8")||"[]");
        }
        for(let i=0;i<this.cookies?.length;i++){
            if(this.cookies[i].value===value){
                cookie=this.cookies[i];
                foundIndex=i;
                break;
            }
        }
        if(cookie?.expires<new Date().toISOString()){ // cookie has expired
            this.destroy(foundIndex);
            return;
        }
        return cookie;
    }
   async set(username:string,name:string,value:string){
        if(!this.cookies.length) this.cookies=JSON.parse(await readFilePromise(__dirname+"/session.json","utf-8")||"[]");
        let expires = new Date().getTime() + 24 * 60 * 60 * 1000;
        this.cookies=this.cookies.filter(cookie=>cookie.value!==value);
        this.cookies.push({name,value,username,expires:new Date(expires).toISOString()});
        return writeFilePromise(__dirname+"/session.json",JSON.stringify(this.cookies))
    }
    async remove(value:string){
        if(!this.cookies.length) this.cookies = JSON.parse(
          (await readFilePromise(__dirname + "/session.json", "utf-8")) || "[]"
        );
        this.cookies=this.cookies.filter(cookie=>cookie.value!==value);
        return writeFilePromise(
          __dirname + "/session.json",
          JSON.stringify(this.cookies)
        );
    }
}


export default new Store();