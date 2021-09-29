const config = {
    url: "https://api.recursionist.io/builder/computers?type=",
    target: document.getElementById("target"),
    parts: ["cpu", "gpu", "ram", "hdd", "ssd"],
    partsLabels: {
        "CPU": ["Brand", "Model"],
        "GPU": ["Brand", "Model"],
        "RAM": ["How_Many", "Brand", "Model"],
        "Storage": ["HDD_or_SSD", "Storage", "Brand", "Model"],
    },
    CPU: [],
    GPU: [],
    RAM: [],
    Storage: [],
    pcCounter: 0,
    preBuildComputer: {
        "CPU": "",
        "GPU": "",
        "RAM": "",
        "Storage": "",
    }
};

class Computer{
    constructor(cpu, gpu, ram, storage){
        this.cpu = cpu;
        this.gpu = gpu;
        this.ram = ram;
        this.storage = storage;
    }

    caluculateBenchmarkForGaming(){
        let storageRate = (this.storage.Type === 'HDD') ? 0.025: 0.1;
        let benchmark = this.cpu.Benchmark * 0.25;
        benchmark += this.gpu.Benchmark * 0.6;
        benchmark += this.ram.Benchmark * 0.125;
        benchmark += this.storage.Benchmark * storageRate;

        return Math.floor(benchmark);
    };
    caluculateBenchmarkForWork(){
        let benchmark = this.cpu.Benchmark * 0.6;
        benchmark += this.gpu.Benchmark * 0.25;
        benchmark += this.ram.Benchmark * 0.10;
        benchmark += this.storage.Benchmark * 0.05;

        return Math.floor(benchmark);
    };
};

class View{
    static createSelectCompornents(optionItemList){
        //optionItemListにはlabelでfilterした後の配列を渡す
        let optionHTML =`<option selected>Choose...</option>`;

        for(let item of optionItemList){
            optionHTML += `<option value="${item}">${item}</option>`
        };

        return optionHTML;
    };
    static createSelectParts(partsName, label, partsList){
        //各parts, brand/Modelなどlabel毎のselect要素を作成
        let container = document.createElement('div');
        container.classList.add("input-group", "mb-3", "px-3");
        container.innerHTML =
        `
        <div class="input-group-prepend">
            <label class="input-group-text" for="inputGroupSelect${partsName + label}">${label.replace(/_/g, " ")}</label>
        </div>
        `

        let optionItem = Controller.getOptionItems(partsList, label);

        let select = document.createElement('select');
        select.id = "inputGroupSelect" + partsName + label;
        select.setAttribute("data-label", label);
        select.classList.add("custom-select", partsName);
        select.innerHTML = View.createSelectCompornents(optionItem);

        container.append(select);
        return container;
    };
    static createSelectInterface(stepCount, partsName, labels){
        //labelの配列を引数とする
        let container = document.createElement('div');
        container.classList.add('pb-4');

        let h4 = document.createElement('h4');
        h4.innerHTML = `step${stepCount}: Select your ${partsName}`;
        if(partsName === "RAM"){
            h4.innerHTML = `step${stepCount}: Select your Memory Card`;
        }

        let innerContainer = document.createElement('div');
        innerContainer.classList.add('d-lg-flex')

        //各partsの配列
        let partsList = config[partsName];

        for(let i=0; i < labels.length; i++){
            let selectDiv = View.createSelectParts(partsName, labels[i], partsList);

            //要素が変更された時の挙動
            selectDiv.addEventListener('change', function(){
                Controller.changeOption(partsName, labels[i]);
                // console.log(config.preBuildComputer);
            })

            innerContainer.append(selectDiv);
        }

        container.append(h4);
        container.append(innerContainer);

        return container;
    };
    static createAddPcBtn(btnLabel){
        let btnDiv = document.createElement('div');
        btnDiv.classList.add("mb-5");
        btnDiv.innerHTML =
        `
        <div class="d-flex justify-content-center py-3">
            <button type="button" class="btn-lg btn-primary">${btnLabel}</button>
        </div>
        `

        //controllerで入力値のデータを取得 → オブジェクト作成
        btnDiv.querySelectorAll(".btn-lg")[0].addEventListener('click', function(){
            if(Controller.isValid()){
                const detailPage = document.getElementById('detail');

                //build pc
                let cpu = config.preBuildComputer["CPU"][0];
                let gpu = config.preBuildComputer["GPU"][0];
                let ram = config.preBuildComputer["RAM"][0];
                let storage = config.preBuildComputer["Storage"][0];

                let addPC = new Computer(cpu, gpu, ram, storage);
                detailPage.append(View.getComputerDetailPage(addPC));
            }else{
                alert("パーツを全て選択してください");
            }
        });

        return btnDiv;
    };
    static getSelectPage(){
        let container = document.createElement('div');

        //title
        let h1 = document.createElement('h1');
        h1.classList.add("py-5", "mb-5", "bg-secondary", "text-light", "text-center");
        h1.innerHTML = "Build Your Own PC";
        container.append(h1);

        //入力エリアの要素
        let inputContainer = document.createElement('div');
        inputContainer.classList.add("container", "mb-5");

        let count = 1;

        for(let key in config.partsLabels){

            let selectDiv = View.createSelectInterface(count, key, config.partsLabels[key]);
            inputContainer.append(selectDiv);
            count++;
        }
        container.append(inputContainer);

        //ボタン要素
        let btnDiv = View.createAddPcBtn("Add PC");
        container.append(btnDiv);

        //add PC表示用の要素
        let detailPartsDiv = document.createElement('div');
        detailPartsDiv.id = 'detail';
        detailPartsDiv.classList.add("container");
        container.append(detailPartsDiv);

        return container;
    }
    static createScoreDisplay(ComputerObj){
        let container = document.createElement('div');
        container.innerHTML =
        `
            <p class="bg-dark text-light px-3 py-2">Score</p>
            <div class="d-flex justify-content-center mb-3">
                <div class="p-3 text-center">
                    <h2 class="">Gaming: ${ComputerObj.caluculateBenchmarkForGaming()}%</h2>
                    <h2 class="">Work: ${ComputerObj.caluculateBenchmarkForWork()}%</h2>
                </div>
            </div>
        `
        return container;

    };
    static createPartsList(ComputerObj){
        let container = document.createElement('div');
        container.innerHTML =
        `
            <table class="table table-striped text-center">
            <thead>
                <tr class="table bg-dark text-light">
                    <th scope="col">Parts</th>
                    <th scope="col">Brand</th>
                    <th scope="col">Model</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">CPU</th>
                    <td>${ComputerObj.cpu.Brand}</td>
                    <td>${ComputerObj.cpu.Model}</td>
                </tr>
                <tr>
                    <th scope="row">GPU</th>
                    <td>${ComputerObj.gpu.Brand}</td>
                    <td>${ComputerObj.gpu.Model}</td>
                </tr>
                <tr>
                    <th scope="row">Memory</th>
                    <td>${ComputerObj.ram.Brand}</td>
                    <td>${ComputerObj.ram.Model}</td>
                </tr>
                <tr>
                    <th scope="row">${ComputerObj.storage.Type}</th>
                    <td>${ComputerObj.storage.Brand}</td>
                    <td>${ComputerObj.storage.Model}</td>
                </tr>
            </tbody>
        </table>
        `
        return container;
    };
    static getComputerDetailPage(ComputerObj){
        //add PCボタンを押した時に発火
        config.pcCounter += 1;

        let detailContainer = document.createElement('div');
        detailContainer.classList.add("border", "rounded", "mb-5");

        let title = document.createElement('h2');
        title.innerHTML = `No. ${config.pcCounter}`;

        let scoreDisplayContainer = View.createScoreDisplay(ComputerObj);
        let partsListContainer = View.createPartsList(ComputerObj);

        detailContainer.append(title);
        detailContainer.append(scoreDisplayContainer);
        detailContainer.append(partsListContainer);
        return detailContainer;
    }
};


class Controller{
    static initialize(){
        Controller.getPartsData();

        setTimeout(function(){
            config.target.append(View.getSelectPage());
        },300);
    }
    static getPartsData(){
        for(let parts of config.parts){
            fetch(config.url + parts).then(response => response.json()).then(data => {
                if(parts === "hdd" || parts === "ssd"){
                    config["Storage"] = config["Storage"].concat(data);
                }else{
                    config[parts.toUpperCase()] = config[parts.toUpperCase()].concat(data);
                }
            });
        }
    }
    static filterPartsLabel(arr, partsLabel, value){
        //How_Many, HDD_or_SSD, Storageに対応できていない
        if(partsLabel === "HDD_or_SSD"){
            return arr.filter(parts => parts["Type"] === value);

        }else if(partsLabel === "How_Many"){
            return arr.filter(parts => Controller.getNumberOfMemoryCards(parts["Model"]) === value);

        }else if(partsLabel === "Storage"){
            return arr.filter(parts => Controller.getStorageSize(parts["Model"]) === value);

        }else{
            return arr.filter(parts => parts[partsLabel] === value);
        }
    };
    static getOptionItems(arr, label){
        //labelでfilterされた後のoptionを配列で返す
        let resArr;

        if(label === "How_Many"){
            //labelがhow manyの時はmodelの配列を取得し、model名からメモリカード枚数を取得
            resArr = arr.map(parts => parts["Model"]);
            resArr = resArr.map(model => Controller.getNumberOfMemoryCards(model));
        }else if(label === "HDD_or_SSD"){
            resArr = arr.map(parts => parts["Type"]);
        }else if(label === "Storage"){
            resArr = arr.map(parts => parts["Model"]);
            resArr = resArr.map(model => Controller.getStorageSize(model));
        }else{
            resArr = arr.map(parts => parts[label]);
        }

        return new Set(resArr);
    };
    static updateOptionList(nodeList, partsList){
        //選択していないoption listを更新
        nodeList.forEach(selectNode => {
            if(selectNode.value === "Choose..."){
                let label = selectNode.getAttribute("data-label");
                let partsListByLabel = Controller.getOptionItems(partsList, label);
                selectNode.innerHTML = "";
                selectNode.innerHTML = View.createSelectCompornents(partsListByLabel);
            }
        });
    };
    static changeOption(partsName, currLabel){
        //optionが変更された時の挙動

        //変更後の値を読取
        let selectNodes = document.querySelectorAll("." + partsName);

        //partsListを取得
        let partsList = config[partsName];

        //選ばれているラベルの値でpartsListを更新
        selectNodes.forEach(selectNode => {
            if(selectNode.value !== "Choose..."){
                let label = selectNode.getAttribute("data-label");
                partsList = Controller.filterPartsLabel(partsList, label, selectNode.value);
            }
        });

        //選択していないoption listを更新
        Controller.updateOptionList(selectNodes, partsList);
        // console.log(partsList);

        if(partsList.length === 0){
            Controller.partOfResetOption(partsName, currLabel);
        }else if(partsList.length <= 2){
            config.preBuildComputer[partsName] = partsList;
        }
    };
    static partOfResetOption(partsName, currLabel){
        let selects = document.querySelectorAll(`.${partsName}`);

        for(let select of selects){
            if(currLabel !== select.getAttribute("data-label")){
                select.innerHTML = "<option selected>Choose...</option>";
            };
        }
        config.preBuildComputer[partsName] = "";

        //再度option listを更新する
        Controller.changeOption(partsName);
    };
    static getStorageSize(model){
        //model名を引数としてStorageサイズを返す
        let regex = /\d{1,3}[TG]B/g;
        let storage = model.match(regex);

        return storage[0];
    };
    static getNumberOfMemoryCards(model){
        //モデル名を引数としてメモリーカードの枚数を返す
        return model.split(" ").pop().split("x").shift();
    }

    static isValid(){
        //全て選択されていればtrueを返す
        //未選択のものがある場合はfalseを返す
        let selectNodes = document.querySelectorAll(".custom-select");

        for(let selectNode of selectNodes){
            if(selectNode.value === "Choose..."){ return false;}
        }
        return true;
    };
};


Controller.initialize();