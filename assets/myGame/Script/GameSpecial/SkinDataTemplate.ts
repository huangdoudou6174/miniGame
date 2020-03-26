export default class SkinDataTemplate {
    private constructor() { }
    public static getData() {
        return {
            //key：对应皮肤id
            1: {
                id: 1,
                model: "Cube",      //皮肤对应的3D模型预制件的名称
                skin: "1",          //皮肤贴图文件名
                itemUrl: "1",       //在商城中显示的商品项的图片名称
                price: 200,         //价格
                displayUrl: "",     //在商城中选中商品时，在展示台上要显示的图片（展示方式为2D图片时有效）
                name: ""            //皮肤名称
            },
        }
    }
}