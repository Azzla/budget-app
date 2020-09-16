/////////////////////////////////
//Budget Control////////////////
var budgetController = (function() {
	
	//Function constructors
	var Expense = function(id, desc, value) {
		this.id = id;
		this.desc = desc;
		this.value = value;
		this.percentage = -1;
	};
	
	Expense.prototype.calcPercentage = function(totalInc) {
		if (totalInc > 0) {
			this.percentage = Math.round((this.value / totalInc) * 100);
		}
		else {
			this.percentage = -1;
		}
	};
	
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	
	var Income = function(id, desc, value) {
		this.id = id;
		this.desc = desc;
		this.value = value;
	};
	
	var calcTotal = function(type) {
		var sum = 0;
		
		//Loop over entries in data structure, sum them, and store them in totals
		data.allItems[type].forEach(function(curr) {
			sum = sum + curr.value;
		});
		data.totals[type] = sum;
	};
	
	//Full data structure
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};
	
	return {
		addItem: function(type, des, val) {
			var newItem, ID;
			
			//Assign proper index for our data structure based on type (exp or inc)
			var i = data.allItems[type];
			
			//Create new ID for item
			if (i.length > 0) {
				ID = i[i.length - 1].id + 1;
			}
			else {
				ID = 0;
			}
			
			//Construct item instance exp/inc
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			}
			else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}
			else {
				console.log('Error, type of addItem not recieved.');
			}
			
			//Push item into our data structure
			i.push(newItem);
			
			//Return the item for controller use/storage
			return newItem;
		},
		
		deleteItem: function(type, id) {
			var IDarr, index;
			
			//Create array of all ids
			IDarr = data.allItems[type].map(function(curr) {
				return curr.id;
			});
			
			//Determine the index of the object (based on id)
			index = IDarr.indexOf(id);
			
			//Remove 1 object from the data structure at specified index
			if (index !== -1) {
				data.allItems[type].splice(index, 1)
			}
		},
		
		calculateBudget: function() {
			//Calculate total income and expenses
			calcTotal('inc');
			calcTotal('exp');
			
			//Calculate the budget: inc - exp
			data.budget = data.totals.inc - data.totals.exp;
			
			//Calculate the percentage of income spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			}
			else {
				data.percentage = -1;
			}
		},
		
		calculatePercentages: function() {
			data.allItems.exp.forEach(function(curr) {
				curr.calcPercentage(data.totals.inc);
			});
		},
		
		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(curr) {
				return curr.getPercentage();
			});
			return allPerc;
		},
		
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		}
	};
	
})();


////////////////////////////////
//UI Control///////////////////
var uiController = (function() {

	var DOMStrings = {
		inputType: '.add__type',
		inputDesc: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		budgetIncome: '.budget__income--value',
		budgetExpenses: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		itemPercentage: '.item__percentage',
		dateLabel: '.budget__title--month',
		container: '.container'
	};
	
	var formatNumber = function(num, type) {
		var numSplit, int, dec, sign;
		
		num = Math.abs(num);
		num = num.toFixed(2);
		
		numSplit = num.split('.');
		int = numSplit[0];
		dec = numSplit[1];
		
		//Place comma
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}
		
		// Display sign if number is not zero
		if (parseFloat(num) !== 0) {
			type === 'exp' ? sign = '-' : sign = '+';
		}
		else {
			sign = '';
		}
		
		//Concatenate and return finalized string
		return sign + ' ' + int + '.' + dec;
	};
	
	//Define a local forEach function that works with our DOMtree nodes
	var nodeListForEach = function(list, callback) {
		for (i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};
	
	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMStrings.inputType).value, // inc or exp
				desc: document.querySelector(DOMStrings.inputDesc).value,
				value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
			};
		},
		
		addListItem: function(obj, type) {
			var html, newHtml, element;
			
			//Create HTML string with placeholder text
			if (type === 'inc') {
				element = DOMStrings.incomeContainer;
				/////////////////////////
				// !! --REMINDER-- !! // Study this HTML/full HTML document
				////////////////////////
				html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%desc%</div> <div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
			else if (type === 'exp'){
				element = DOMStrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%desc%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
			
			//Replace placeholder text with data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%desc%', obj.desc);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			
			//Insert HTML into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		
		deleteListItem: function(selectorID) {
			//Select and delete the item from the DOM
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},
		
		clearFields: function() {
			var fields, fieldsArr;
			
			//Select fields to clear and slice into Array
			fields = document.querySelectorAll(DOMStrings.inputDesc + ', ' + DOMStrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);
			
			//Set each field in the array to an empty string
			fieldsArr.forEach(function(curr) {
				curr.value = "";
			});
			
			//Place cursor back into description field
			fieldsArr[0].focus();
		},
		
		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMStrings.budgetIncome).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMStrings.budgetExpenses).textContent = formatNumber(obj.totalExp, 'exp');
			if (obj.percentage > 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
			}
			else {
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}
		},
		
		displayPercentages: function(percs) {
			var fields = document.querySelectorAll(DOMStrings.itemPercentage);
			
			//Call nodeForEach function with our retrieved fields
			nodeListForEach(fields, function(curr, i) {
				if (percs[i] > 0) {
					curr.textContent = percs[i] + '%';
				}
				else {
					curr.textContent = '---';
				}
			});
			
		},
		
		displayMonth: function() {
			var now, year, month, mArr;
			now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
			mArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
							'August', 'September', 'October', 'November', 'December'];
			document.querySelector(DOMStrings.dateLabel).textContent = mArr[month] + ', ' + year;
		},
		
		changeType: function() {
			var fields = document.querySelectorAll(
				DOMStrings.inputType + ',' +
				DOMStrings.inputDesc + ',' +
				DOMStrings.inputValue
			);
			
			nodeListForEach(fields, function(curr) {
				curr.classList.toggle('red-focus');
			});
			
			document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
			
		},
		
		getDOMStrings: function() {
			return DOMStrings;
		}
	};

})();


///////////////////////////////////////////
//Global App Control//////////////////////
var controller = (function(budgetCtrl, UICtrl) {
	
	//Init event listeners and DOM Strings
	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMStrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
		document.addEventListener('keypress', function(e) {
			if (e.keyCode === 13 || e.which === 13) {
				ctrlAddItem();
			}
		});
	};
	
	var updateBudget = function() {
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();
		
		// 2. Return the budget
		var budget = budgetCtrl.getBudget();
		
		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};
	
	var updatePercentages = function() {
		// 1. Update percentages
		budgetCtrl.calculatePercentages();
		
		// 2. Read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages();
		
		// 3. Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
		
	};
	
	var ctrlAddItem = function() {
		var input, newItem;
		
		// 1. Get the filled input data
		input = UICtrl.getInput();
		
		if (input.desc !== "" && !isNaN(input.value) && input.value > 0)
		{
			// 2. Send input to the budgetController and retrieve item
			newItem = budgetCtrl.addItem(input.type, input.desc, input.value);
			
			// 3. Add the item to the UI & clear the fields
			UICtrl.addListItem(newItem, input.type);
			UICtrl.clearFields();
			
			// 4. Calculate and update budget
			updateBudget();
			
			// 5. Calculate and update percentages
			updatePercentages();
		}
	};
	
	var ctrlDeleteItem = function(e) {
		var itemID, splitID, type, ID;
		
		itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
			
			// 1. Delete item from data structure
			budgetCtrl.deleteItem(type, ID);
			
			// 2. Delete item from the UI
			UICtrl.deleteListItem(itemID);
			
			// 3. Re-calculate and display the budget
			updateBudget();
			
			// 4. Calculate and update percentages
			updatePercentages();
		}
	};

	return {
		init: function() {
			console.log('App initialized.');
			UICtrl.displayMonth();
			//Set all visible fields to 0
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};

})(budgetController, uiController);

/////////////////////////////////////////////
// Init program /////////////////////////////
controller.init();
////////////////////////////////////////////
















//
