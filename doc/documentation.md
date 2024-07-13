
# LDRX Documentation

---

## 1. Using the LDRX Interpreter

> [!NOTE]
> Knowledge of HTML is required to properly use LDRX

### 1.1 Install LDRX

Add the LDRX interpreter to the HTML page with the file to download (`ldrx.min.js`):
<https://raw.githubusercontent.com/AntoineLandrieux/LDRX/main/src/min/ldrx.min.js>

```html
<!DOCTYPE html>
<html>
<head>
    ...
    <script src="ldrx.min.js">
</head>
<body>
    ...
</body>
</html>
```

### 1.2 Use LDRX

To insert LDRX code into an html page, we will use the `<ldrx-run>` tag.

```html
<!DOCTYPE html>
<html>
<head>
    ...
    <script src="ldrx.min.js">
</head>
<body>
    <ldrx-run>
        ...
    </ldrx-run>
</body>
</html>
```

---

## 2. An Informal Introduction to LDRX

Many of the examples in this manual, even those entered at the interactive prompt, include comments. Comments in LDRX start with the hash character, \, and extend to the end of the physical line. A comment may appear at the start of a line or following whitespace or code, but not within a string literal. Since comments are to clarify code and are not interpreted by LDRX, they may be omitted when typing in examples.

Some examples:

```html
<ldrx-run>
\ this is the first comment
$spam 1; \ and this is the second comment
        \ ... and now a third!
$text "\ This is not a comment because it's inside quotes.";
</ldrx-run>
```

> [!NOTE]
> You can put ";" at the end of an instruction to say that it is finished

## 2.1 Text

LDRX can manipulate text (represented by type string) as well as numbers. This includes characters "!", words "rabbit", names "Paris", sentences "Got your back.", etc. "Yay!✌️". They can be enclosed in single quotes ('...') or double quotes ("...") with the same result.

To display the text we will use the keyword "print":

```html
<ldrx-run>
print "Hello World!";
</ldrx-run>
```

## 3. Store Datas

### 3.1 Variables

A variable allows you to store a number, text, function, or a statement.
A variable is defined by a name, a type, and a value.

```html
</ldrx-run>
\ text
string text "Hello";

\ number (integer)
integer number 1;

\ number (Floating-point number)
float floating 1.58;

\ any type
any anytype1 "Hy";
$   anytype2 8;

\ statement
string message {
    if number && floating {
        return any;
    else
        return text;
    }
};

fn add(float x, float y) {
    return x + y;
}

\ function
$ fn_ptr add;

print message; \ "Hy"
print fn_ptr(number, floating); \ 2.58
</ldrx-run>
```

### 3.2 Defining Functions

We can create a function that writes the Fibonacci series to an arbitrary boundary:

```html
</ldrx-run>
\ write Fibonacci series up to n
fn fib(integer n) {
    \ Print a Fibonacci series up to n.
    integer a 0;
    integer b 1;

    while a < n {
        print a + " ";
        integer a b;
        integer b a + b;
    }
    
    return a;
}

\ Now call the function we just defined:
print "The lasted value is " + fib(2000);
</ldrx-run>
```

The keyword fn introduces a function definition. It must be followed by the function name and the parenthesized list of formal parameters.

### 3.3 The rem statement

The delete operator deletes both the value of the property and the property itself. After deletion, the property cannot be used before it is added back again.

```html
<ldrx-run>
string message "Hello World!";

print message; \ "Hello World!"
rem message;
print message; \ "Undefined";
</ldrx-run>
```

## 4. More Control Flow Tools

### 4.1 while Statements

The while loop executes as long as the condition (here: a < 10) remains true. In LDRX, like in C, any non-zero integer value is true; zero is false. The test used in the example is a simple comparison. The standard comparison operators are written the same as in C: < (less than), > (greater than), == (equal to), <= (less than or equal to), >= (greater than or equal to) and != (not equal to).

```html
<ldrx-run>
\ Fibonacci series:
\ the sum of two elements defines the next
integer a 0;
integer b 1;

while a < 10 {
    print a + "<br />";
    integer a b;
    integer b a + b;
}
</ldrx-run>
```

> [!NOTE]
> You can add HTML to the output

### 4.2 if Statements

Perhaps the most well-known statement type is the if statement. For example:

```html
<ldrx-run>
print "Enter a number:";
ask x;
\ Convert string to int 
integer x x;

if x < 0 {
    print "Negative changed to zero";
else x == 0
    print "Zero";
else x == 1
    print "Single";
else
    print "More";
}
</ldrx-run>
```
