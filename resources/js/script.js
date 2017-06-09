var dataController = (function() {
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(element){
            sum += element.value;
        });
        
        data.totals[type] = sum;
    }
    
    return {
        addItem: function(type, description, value) {
            var newItem, ID;
            
            // inc = [ob1, ob2, ob3, ob4, ob5]
            // ID = last ID + 1
            
            // Create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new Item
            if(type === "inc") {
                newItem = new Income(ID, description, value);
            } else if(type === "exp") {
                newItem = new Expense(ID, description, value);
            }
            
            // Push it into data
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var IDs, index;
            
            // id = 6;
            // IDs = [1, 2, 4, 6, 8];
            // index = 3;
            
            // Create array with ID
            IDs = data.allItems[type].map(function(e) {
                return e.id;
            });
            
            // Find id's index
            index = IDs.indexOf(id);
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function(){
            
            // Calculate total income and expenses
            calculateTotal("inc");
            calculateTotal("exp");
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        getBudget: function() {
            return {
                income: data.totals.inc,
                expenses: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage
            }
        },
        
        test: function() {
            console.log(data);
        }
    }
    
})();

var UIController = (function() {
    
    var DOMstrings = {
        btnAdd: ".add-btn",
        inpuyType: ".add-type",
        inputDescription: ".add-description",
        inputValue: ".add-value",
        incomeContainer: ".income-list",
        expenseContainer: ".expenses-list",
        incomeLabel: ".budget-income-value",
        expensesLabel: ".budget-expenses-value",
        percentageLabel: ".budget-expenses-percentage",
        budgetLabelValue: ".budget-value",
        bottomPart: ".bottom",
        expensesPercentageLabel: ".item-percentage",
        dateLabel: ".budget-title--month"
        
    }
    
    var formatNumber = function(num, type) {

        var int, numSplit, decimal;
        // + or -  before number

        // Remove sign of the number + / -
        num = Math.abs(num);
        // Decimal two number
        num = num.toFixed(2);

        numSplit = num.split(".");

        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }

        decimal= numSplit[1];

        return (type === "exp" ? "-" : "+") + " " + int + "." + decimal;

    }
    
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inpuyType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        
        addListItem: function(obj, type) {
            var html, newHTML, element;
            
            // Create HTML string with placeholder
            if(type === "inc"){
                element = DOMstrings.incomeContainer;
                html = '<div class="item animated zoomIn" id="inc-%id%"><div class="item-title">%description%</div><div class="right"><div class="item-value">%value%</div><div class="item-delete"><button class="item-delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === "exp") {
                element = DOMstrings.expenseContainer;
                html = '<div class="item animated zoomIn" id="exp-%id%"><div class="item-title">%description%</div><div class="right"><div class="item-value">%value%</div><div class="item-delete"><button class="item-delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            };
            
            // Replace the placeholder text
            newHTML = html.replace("%id%", obj.id);
            newHTML = newHTML.replace("%description%", obj.description);
            newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
        },
        
        deleteListItem: function(selectorID) {
            var item;
            
            item = document.getElementById(selectorID);
            
            item.classList.add("zoomOut");
            
            setTimeout(function() {
                item.parentNode.removeChild(item);
            }, 400)
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            
            // Convert list to array
            fieldsArr = Array.prototype.slice.call(fields);
            
            fields.forEach(function(element){
                element.value = "";
            });
            
            fields[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            
            obj.budget > -1 ? type = "inc" : type = "exp";
            
            document.querySelector(DOMstrings.budgetLabelValue).textContent = formatNumber(obj.budget, type);
            
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.income, "inc");
            
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.expenses, "exp");
            
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "...";
            }
            
        },
        
        displayMonth :function() {
            var now, month,months,  year;
            
            now = new Date();
            
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            month = now.getMonth();
            
            // Return year
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
            
        },
        
        getDOMString: function() {
            return DOMstrings;
        }
    }
    
})();

var AppController = (function(dataCrtl, UICrtl) {
    var DOM;
    
    DOM = UICrtl.getDOMString();
    
    var updateBudget = function() {
        var budget;
        // 1. Calculate the budget
        dataCrtl.calculateBudget();
        
        // 2. Return the budget
        budget = dataCrtl.getBudget();
        
        // 3. Display the budget on the UI
        UICrtl.displayBudget(budget);
    }
    
    
    var controllAdItem = function() {
        var inputData, newItem;
        
        // 1. Get input filed data
        inputData = UICrtl.getInput();
        
        if(inputData.description !== "" && !isNaN(inputData.value) && inputData.value > 0) {
            
            // 2. Add item to the budget controller
            newItem = dataCrtl.addItem(inputData.type, inputData.description, inputData.value);

            // 3. Add item to the UI
            UICrtl.addListItem(newItem, inputData.type);

            // 4. Clear the fields
            UICrtl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
        }
    }
    
    var controllDeleteItem = function(e) {
        var itemID, splitID, type, ID;
        
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete the item from the data structure
            dataCrtl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICrtl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
        }
    }
    
    var setUpEventListeners = function() {
        document.querySelector(DOM.btnAdd).addEventListener("click", controllAdItem);
        
        document.addEventListener("keypress", function(e) {
            if(e.keyCode === 13 || e.which === 13) {
                controllAdItem();
            }
        });
        
        document.querySelector(DOM.bottomPart).addEventListener("click", controllDeleteItem);
    }
    
    return {
        init: function() {
            console.log("App is working");
            
            UICrtl.displayMonth();
            
            UICrtl.displayBudget({
                income: 0,
                expenses: 0,
                budget: 0,
                percentage: 0
            });
            
            setUpEventListeners();
        }
    }
    
})(dataController, UIController);

AppController.init();