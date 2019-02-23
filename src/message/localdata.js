class localdata {
    localSet(name,data){
        return localStorage.setItem(name, JSON.stringify(data))
    }
    
    localSet(name){
        return JSON.parse(localStorage.getItem(name))
    }
}