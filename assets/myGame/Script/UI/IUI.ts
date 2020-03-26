//UI类接口
export interface IUI {
    uiType: any;
    init: (data?: any) => void;
    reset: () => void;
    show: (data?: any) => void;
    hide: () => void;
    getData: (data?: any) => any;
}

