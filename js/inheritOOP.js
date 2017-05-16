/**
 * This function contains the code necessary for subclassing and should be called
 * immediately following the creation of a class constructor for a class that wants
 * to be a subclass of another and inherit its properties and methods
 *
 * Reference: This code snippet was taken from http://phrogz.net/js/classes/OOPinJS2.html
 *
 * e.g.
 * ANewSubClass = function() {}
 * ANewSubClass.inheritsFrom(ExistingClass)
 *
 * @param {object} parentClassOrObject - the superclass this class wants to inherit from
 * @return {object} the subclass
 */
Function.prototype.inheritsFrom = function( parentClassOrObject ){
	if ( parentClassOrObject.constructor == Function )
	{
		//Normal Inheritance 
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	}
	else
	{
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	}
	return this;
};

//   From JavaScript权威指南第6章
// inherit() returns a newly created object that inherits properties from the
// prototype object p.  It uses the ECMAScript 5 function Object.create() if
// it is defined, and otherwise falls back to an older technique.
function inherit(p) {
    if (p == null) throw TypeError(); // p must be a non-null object
    if (Object.create)                // If Object.create() is defined...
        return Object.create(p);      //    then just use it.
    var t = typeof p;                 // Otherwise do some more type checking
    if (t !== "object" && t !== "function") throw TypeError();
    function f() {};                  // Define a dummy constructor function.
    f.prototype = p;                  // Set its prototype property to p.
    return new f();                   // Use f() to create an "heir" of p.
}


/*  From JavaScript权威指南第9章
 * This function returns a subclass of specified Set class and overrides 
 * the add() method of that class to apply the specified filter.
 */
function filteredSetSubclass(superclass, filter) {
    var constructor = function() {          // The subclass constructor
        superclass.apply(this, arguments);  // Chains to the superclass
    };
    var proto = constructor.prototype = inherit(superclass.prototype);
    proto.constructor = constructor;
    proto.add = function() {
        // Apply the filter to all arguments before adding any
        for(var i = 0; i < arguments.length; i++) {
            var v = arguments[i];
            if (!filter(v)) throw("value " + v + " rejected by filter");
        }
        // Chain to our superclass add implementation
        superclass.prototype.add.apply(this, arguments);
    };
    return constructor;
}

// JavaScript高级程序设计第三版  第6章 继承， 寄生组合式继承
//即通过借用构造函数来继承属性，通过原型链的混成形式来继承方法。其背
//后的基本思路是：不必为了指定子类型的原型而调用超类型的构造函数，我们所需要的无非就是超类型
//原型的一个副本而已
function inheritPrototype(subType, superType) {
	var prototype = Object.create(superType.prototype); //create object
	prototype.constructor = subType; //augment object
	subType.prototype = prototype; //assign object
}

//Obejct.create的实现
function object(o) {
	function F() {}
	F.prototype = o;
	return new F();
}











