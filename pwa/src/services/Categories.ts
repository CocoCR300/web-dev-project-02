import PouchDB from "pouchdb"
import {create, get, remove, update} from "../database"
import type { Category } from "../typedef"

const DATABASE = new PouchDB("categories")

DATABASE.createIndex({
    index: {fields: ["name"]}
})

export async function category(searchFilter: string, offset: number, limit:number): Promise<Category[]>{
    const categories = await get(DATABASE, "name", searchFilter, offset, limit);
    return categories
}

export async function saveCategory(category: Category) {
    if(category._id){
        return update(DATABASE, category._id, category);
    }
    else{
        const id = await create(DATABASE, category);
        if(id){
            category._id = id;
        }
        return id!=="";
        
    }
}
export async function deleteCategory(id:string): Promise<boolean> {
    return await remove(DATABASE, id)
    
}