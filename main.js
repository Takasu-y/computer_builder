const config = {
    url: "https://api.recursionist.io/builder/computers?type=",
    target: document.getElementById("target"),
    parts: ["cpu", "gpu", "ram", "hdd", "ssd"],
    partsLabels: {
        "CPU": ["Brand", "Model"],
        "GPU": ["Brand", "Model"],
        "Memory Card": ["How Many", "Brand", "Model"],
        // "Storage": ["HDD or SSD", "Storage", "Brand", "Model"],
    },
    dataBase: [],
    pcCounter: 0,
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
    static createSelectCompornents(partsName, label, optionItemList){
        //optionItemListにはlabelでfilterした後の配列を渡す
        let select = document.createElement('select');
        select.id = "inputGroupSelect" + partsName + label;
        select.classList.add("custom-select");

        select.innerHTML +=`<option selected>Choose...</option>`;
        console.log(optionItemList);

        for(let item of optionItemList){
            select.innerHTML += `<option value="${item}">${item}</option>`
        };

        return select;
    };
    static createSelectParts(partsName, label){
        //各parts, brand/Modelなどlabel毎のselect要素を作成
        let container = document.createElement('div');
        container.classList.add("input-group", "mb-3", "px-3");
        container.innerHTML =
        `
        <div class="input-group-prepend">
            <label class="input-group-text" for="inputGroupSelect${partsName + label}">${label}</label>
        </div>
        `

        let partsList = Controller.filterPartsType(partsName);
        let itemListByLabel = Controller.getOptionItems(partsList, label);

        container.append(this.createSelectCompornents(partsName, label, itemListByLabel));
        return container;
    };
    static createSelectInterface(stepCount, partsName, labels){
        //labelの配列を引数とする
        let container = document.createElement('div');
        container.classList.add('pb-4');

        let h4 = document.createElement('h4');
        h4.innerHTML = `step${stepCount}: Select your ${partsName}`;

        let innerContainer = document.createElement('div');
        innerContainer.classList.add('d-lg-flex')

        labels.forEach(label => {
            let selectDiv = this.createSelectParts(partsName, label);
            innerContainer.append(selectDiv);
        });

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
        btnDiv.addEventListener('click', function(){
            const detailPage = document.getElementById('detail');

            //test build
            let cpu;
            let gpu;
            let ram;
            let ssd;
            let hdd;
            for(let parts of config.dataBase){
                // console.log(parts[0]);
                if(parts[0].Type === "CPU"){ cpu = parts[0]};
                if(parts[0].Type === "GPU"){ gpu = parts[0]};
                if(parts[0].Type === "RAM"){ ram = parts[0]};
                if(parts[0].Type === "SSD"){ ssd = parts[0]};
                if(parts[0].Type === "HDD"){ hdd = parts[0]};
            }
            let addPC = new Computer(cpu, gpu, ram, hdd);


            detailPage.append(View.getComputerDetailPage(addPC));
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
    static getPartsData(){
        for(let parts of config.parts){
            fetch(config.url + parts).then(response => response.json()).then(data => {
                config.dataBase.push(data);
            });
        }
    }
    static filterPartsType(type){
        let partsType = type;
        if(type === "Memory Card"){ partsType = "RAM"};
        for(let partsList of config.dataBase){
            let partsByType = partsList.filter(parts => parts.Type === partsType);

            if(partsByType.length > 0){ return partsByType };
        }
    };
    static filterPartsLabel(arr, partsLabel, value){
        return arr.filter(parts => parts[partsLabel] === value);
    };
    static getOptionItems(arr, key){
        //labelでfilterされた後のoptionを配列で返す
        let resArr = arr.map(parts => parts[key]);
        return new Set(resArr);
    };
    static getStorageSize(model){
        //model名を引数としてStorageサイズを返す
        return model.split(" ").pop();
    };
    static getNumberOfMemoryCards(model){
        //モデル名を引数としてメモリーカードの枚数を返す
        return model.split(" ").pop().split("x").shift();
    }

    static buildComputer(){};
};



// ---------TEST-------------
Controller.getPartsData();
setTimeout(function(){
    // console.log(config.dataBase);
    // let partsList = Controller.filterPartsType("CPU");
    // console.log(partsList);
    // let optionItems1 = Controller.getOptionItems(partsList, "Model");
    // let optionItems2 = Controller.getOptionItems(partsList, "Brand");
    // console.log(optionItems1);
    // console.log(optionItems2);

    // console.log(Controller.filterPartsLabel(partsList, "Brand", "Intel"));
    // console.log(Controller.filterPartsLabel(partsList, "Brand", "AMD"));
    config.target.append(View.getSelectPage());
},100);


// let storageSize = Controller.getStorageSize("900P Optane NVMe PCIe 280GB");
// console.log(storageSize);

// let numberOfMemoryCards = Controller.getNumberOfMemoryCards("Ripjaws 4 DDR4 2400 C14 1x16GB");
// console.log(numberOfMemoryCards);

