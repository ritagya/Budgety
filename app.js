// BUDGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };


    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        total : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    }

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value ;
        });
        data.total[type] = sum;
    };

    return {
        addItem : function(type, des, val){
            var newItem, ID;

            // Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            // Create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push new item into the data object
            data.allItems[type].push(newItem);

            // return newItem
            return newItem;

        },

        daleteItem : function(type, id){

            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id ;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }

        },

        getData : function(){
            return data;
        },

        calculateBudget : function(){

            // Calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget ( income - expenses)
            data.budget = data.total.inc - data.total.exp ;

            // Calculate the percentage of income that we spent
            if(data.total.inc > 0){
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100 );
            } else {
                data.percentage = -1;
            }


        },

        calculatePercentages : function(){

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.total.inc);
            });

        },

        getPercentages : function() {

            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget : function(){
            return {
                budget : data.budget,
                totalInc : data.total.inc,
                totalExp : data.total.exp,
                percentage : data.percentage
            };
        }

    }



})();


// UI CONTROLLER
var UIController = (function(){

    var DOMstrings = {
        type : '.add__type',
        description : '.add__description',
        value : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expenseContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expenseLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensesPercLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
    };

    var formatNumber = function(num, type){

        var numSplit, int, decimal, type;
        // exactly 2 decimal ppoints
        // comma separating thousands

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        decimal = numSplit[1];

        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        // 1 + or - befor number

        return (type  === 'exp' ? '-' : '+') + ' ' + int + '.' + decimal;

    };


    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };


    return {
        getInput : function(){
            var inputObject = {};
            inputObject.type = document.querySelector(DOMstrings.type).value; // exp or inc
            inputObject.description = document.querySelector(DOMstrings.description).value;
            inputObject.value = parseFloat(document.querySelector(DOMstrings.value).value);
            return inputObject;
        },

        getDOMstring : function(){
            return DOMstrings;
        },

        addListItem : function(obj, type){
            var html, newHtml, element;

            // Create HTML string with placeholder text
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            } else if (type === 'exp'){
                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem : function(selectorID){

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields : function(){
            var fields;

            fields = document.querySelectorAll(DOMstrings.description + ',' + DOMstrings.value)

            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArray[0].focus();
        },

        displayBudget : function(obj){

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages : function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });

        },

        displayMonth : function(){

            var now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changedType : function(){

            var fields = document.querySelectorAll(
                DOMstrings.type + ',' +
                DOMstrings.description + ',' +
                DOMstrings.value);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        }

    }


})();


var updateBudget = function(){
    // 1. Calculate budget
    budgetController.calculateBudget();

    // 2. Return the budget
    var budget = budgetController.getBudget();

    // 3. Display budget on UI
    UIController.displayBudget(budget);
}

var updatePercentages = function(){

    // 1. Calculate percentages
    budgetController.calculatePercentages();

    // 2. Read percentages from budget controller
    var percentages = budgetController.getPercentages();

    // 3. Update the UI with new percentages
    UIController.displayPercentages(percentages);

};



// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

    function setupEventListener(){
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if( event.keyCode === 13 ){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.type).addEventListener('change', UICtrl.changedType);
    }

    var DOM = UICtrl.getDOMstring();

    var ctrlAddItem = function(){

        // 1. Get input data
        var input = UICtrl.getInput();
        console.log(input);

        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
            // 2. Add item to budget controller
            var newItem = budgetController.addItem(input.type, input.description, input.value);
            console.log(budgetController.getData());

            // 3. Add item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();

        }
    }

    var ctrlDeleteItem = function(event){
        var itemID , splitID, type, ID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete item from data structure
            budgetCtrl.daleteItem(type, ID);

            // 2. Delete item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show new budget
            updateBudget();

        }
    };

    return {
        init : function(){
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            });
            setupEventListener();
        }
    }

})(budgetController, UIController);


controller.init();
