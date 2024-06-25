
/**
  _     ____  ____  __  __
 | |   |  _ \|  _ \ \ \/ /
 | |   | | | | |_) | \  / 
 | |___| |_| |  _ <  /  \ 
 |_____|____/|_| \_\/_/\_\

 * Antoine LANDRIEUX
 * <https://github.com/AntoineLandrieux/LDRX/>
 * 
 * MIT License
 
**/

class LDRX extends HTMLElement {

    SYMBOL_NULL = "Null";
    SYMBOL_NOTDEF = "Undefined";

    TOKEN_EOF = 0xa00;
    TOKEN_NAME = 0xa01;
    TOKEN_TYPE = 0xa02;
    TOKEN_STRING = 0xa03;
    TOKEN_NUMBER = 0xa04;
    TOKEN_KEYWORD = 0xa05;
    TOKEN_OPERATOR = 0xa06;
    TOKEN_SEMICOLON = 0xa07;
    TOKEN_OPEN = 0xa08;
    TOKEN_CLOSE = 0xa09;

    NODE_ROOT = 0xb00;
    NODE_BODY = 0xb01;
    NODE_TYPE = 0xb02;
    NODE_CALL = 0xb03;
    NODE_IF = 0xb04;
    NODE_GET = 0xb05;
    NODE_WHILE = 0xb06;
    NODE_STORE = 0xb07;
    NODE_ARGVAR = 0xb08;
    NODE_STRING = 0xb09;
    NODE_NUMBER = 0xb0a;
    NODE_RETURN = 0xb0b;
    NODE_OUTPUT = 0xb0c;
    NODE_PROMPT = 0xb0d;
    NODE_REMOVE = 0xb0e;
    NODE_FUNCTION = 0xb0f;
    NODE_OPERATOR = 0xb10;

    ERROR_INTERPRETER = 0x01;
    ERROR_CHARACTER = 0x02;
    ERROR_SYNTAX = 0x03;

    ASSIGNED_ERROR = [
        "Interpreter Error",
        "Unexpected character",
        "Invalid syntax"
    ];

    ASSIGNED_KEYWORD = {
        "if": this.NODE_IF,
        "rem": this.NODE_REMOVE,
        "ask": this.NODE_PROMPT,
        "while": this.NODE_WHILE,
        "print": this.NODE_OUTPUT,
        "return": this.NODE_RETURN
    };

    MEMORY = [
        { name: "LDRX", value: "LDRX (MIT) Antoine LANDRIEUX v1.0.0", arg: null, access: null },
        { name: "DATE", value: new Date().toDateString(), arg: null, access: null },
        { name: "TIME", value: Number(new Date()), arg: null, access: null }
    ];

    /**
     * LDRX (MIT) Antoine LANDRIEUX
     */
    constructor() {
        super();
    }

    connectedCallback() {
        window.onload = () => {
            const code = this.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');;
            this.clear();
            this.run(code);
        }
    }

    AbstractSyntaxTree = class AbstractSyntaxTree {
        /**
         * 
         * @param {string} _Value 
         * @param {number} _Type 
         * @param {AbstractSyntaxTree} _Parent 
         * @param {AbstractSyntaxTree[]} _Children 
        */
        constructor(
            _Value,
            _Type,
            _Parent,
            _Children
        ) {
            this._Value = _Value;
            this._Type = _Type;
            this._Parent = _Parent;
            this._Children = _Children;
        }

        /**
         * 
         * @param {AbstractSyntaxTree} _Node 
         */
        Push(_Node) {
            if (!_Node)
                return this;
            _Node._Parent = this;
            this._Children.push(_Node);
            return this;
        }

        /**
         * 
         * @param {AbstractSyntaxTree} _Node 
         */
        AsParent(_Node) {
            if (!_Node || this == _Node)
                return true;
            return this._Parent ? this._Parent.AsParent(_Node) : false;
        }
    }

    /**
     * 
     * @param {string} _String 
     */
    out(_String) {
        this.innerHTML += _String;
        return null;
    }

    clear() {
        this.innerHTML = "";
        return null;
    }

    /**
     * 
     * @param {number} _Exception 
     * @param {string} _String 
     * @param {number} _Char 
     */
    ThrowLang(_Exception, _String, _Char) {
        const file = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
        const error = `ERROR [${this.ASSIGNED_ERROR[_Exception]}] At '${_String}' At ${file}&lt;ldrx-run&gt;char:${_Char}`;
        return this.out(`<span class="ldrx ldrx-error">${error}</span>`);
    }

    /**
     * 
     * @param {string} _Value 
     * @param {number} _Type 
     */
    AST(_Value, _Type) {
        return new this.AbstractSyntaxTree(_Value, _Type, null, []);
    }

    TYPEs = ["string", "integer", "float", "void", "$"];
    KEYWORDs = ["fn", "return", "print", "while", "if", "else", "rem", "ask"];
    OPERATORs = ["<=", ">=", "==", "!=", "&&", "||", "**", "*", "/", "%", "^", "+", "-", "&", "|", "<", ">"];

    /**
     * 
     * @param {string} _RawCode
     */
    Tokenizer(_RawCode) {

        if (!_RawCode)
            return null;

        let index = 0;
        let adder = 0;
        let token = [];
        let ttype = this.TOKEN_EOF;

        while (_RawCode[index]) {

            adder = 1;

            if (/\s/.test(_RawCode[index])) {
                index += adder;
                continue;
            }

            else if (_RawCode[index] == '\\') {
                while (!/\n|\r/.test(_RawCode[index + adder]) && _RawCode[index + adder])
                    adder++;
                index += adder;
                continue;
            }

            if (_RawCode[index] == ";")
                ttype = this.TOKEN_SEMICOLON;

            else if (_RawCode[index] == "$")
                ttype = this.TOKEN_TYPE;

            else if (/\{|\}/.test(_RawCode[index]))
                ttype = this.TOKEN_KEYWORD;

            else if (/\(|\)/.test(_RawCode[index]))
                ttype = (_RawCode[index] == '(') ? this.TOKEN_OPEN : this.TOKEN_CLOSE;

            else if (this.OPERATORs.includes(_RawCode[index]) || this.OPERATORs.includes(_RawCode.slice(index, index + adder + 1))) {
                if (this.OPERATORs.includes(_RawCode.slice(index, index + adder + 1)))
                    adder++;
                ttype = this.TOKEN_OPERATOR;
            }

            else if (/[a-zA-Z]|_/.test(_RawCode[index])) {
                while (/[a-zA-Z0-9]|_/.test(_RawCode[index + adder]) && _RawCode[index + adder])
                    adder++;
                const txt = _RawCode.slice(index, index + adder);
                ttype = this.KEYWORDs.includes(txt) ? this.TOKEN_KEYWORD : (this.TYPEs.includes(txt) ? this.TOKEN_TYPE : this.TOKEN_NAME);
            }

            else if (/[0-9]/.test(_RawCode[index])) {
                while (!isNaN(_RawCode.slice(index, index + adder + 1)) && !/\s/.test(_RawCode[index + adder]) && _RawCode[index + adder])
                    adder++;
                ttype = this.TOKEN_NUMBER;
            }

            else if (/\"|\'|\`/.test(_RawCode[index])) {
                const quote = _RawCode[index];
                index++;
                while (_RawCode[index + adder] != quote && _RawCode[index + adder])
                    adder++;
                ttype = this.TOKEN_STRING;
            }

            else
                return this.ThrowLang(this.ERROR_CHARACTER, _RawCode[index], index);

            token.push({
                value: _RawCode.slice(index, index + adder),
                type: ttype,
                char: index
            });

            index += adder + (ttype == this.TOKEN_STRING);

        }

        token.push({
            value: null,
            type: this.TOKEN_EOF,
            char: _RawCode.length + 1
        });

        return token;

    }

    /**
     * 
     * @param {object} _Tokens 
     */
    Parse(_Tokens) {

        if (!_Tokens)
            return null;

        let CurrentToken = 0;
        let root = this.AST("root", this.NODE_ROOT);
        let CurrentAST = root;

        let instance_ = this;

        function ParseFunction() {
            let fn = instance_.AST(_Tokens[CurrentToken].value, instance_.NODE_CALL);
            CurrentToken++;

            if (_Tokens[CurrentToken].type != instance_.TOKEN_OPEN) {
                fn._Type = instance_.NODE_GET;
                return fn;
            }

            let arg = instance_.AST("arg", instance_.NODE_ARGVAR);
            CurrentToken++;

            while (_Tokens[CurrentToken].type != instance_.TOKEN_CLOSE) {
                let argv = ParseMath();
                if (!argv)
                    return null;
                arg.Push(argv);
            }

            fn.Push(arg);
            CurrentToken++;
            return fn;
        }

        function ParseValue() {
            let ret = null;

            if ([instance_.TOKEN_STRING, instance_.TOKEN_NUMBER].includes(_Tokens[CurrentToken].type))
                ret = instance_.AST(_Tokens[CurrentToken].value, _Tokens[CurrentToken].type == instance_.TOKEN_STRING ? instance_.NODE_STRING : instance_.NODE_NUMBER);

            if (_Tokens[CurrentToken].type == instance_.TOKEN_NAME)
                return ParseFunction();

            CurrentToken++;
            return ret;
        }

        /**
         * 
         * @param {string} _Operator 
         */
        function MathPriority(_Operator) {
            if ("/*%^".includes(_Operator))
                return 0;
            else if ("+-".includes(_Operator))
                return 1;
            else if ("<=!>".includes(_Operator))
                return 2;
            else if ("&|".includes(_Operator))
                return 3;
            return 4;
        }

        /**
         * 
         * @param {number} _Priority 
         */
        function ParseMath(_Priority = 0xF) {

            let x = ParseValue();
            let y = null;
            let op = null;

            if (!x)
                return null;

            while (_Tokens[CurrentToken].type == instance_.TOKEN_OPERATOR) {
                let priority = MathPriority(_Tokens[CurrentToken].value);

                if (priority >= _Priority)
                    break;

                op = instance_.AST(_Tokens[CurrentToken].value, instance_.NODE_OPERATOR);
                CurrentToken++;

                y = ParseMath(priority);
                if (!y)
                    return null;

                op.Push(x);
                op.Push(y);
                x = op;
            }

            return x;
        }

        while (_Tokens[CurrentToken]) {

            if (_Tokens[CurrentToken].type == this.TOKEN_EOF)
                break;

            else if (_Tokens[CurrentToken].type == this.TOKEN_SEMICOLON) {
                CurrentToken++;
                continue;
            }

            switch (_Tokens[CurrentToken].type) {

                case this.TOKEN_KEYWORD:

                    const keyword = _Tokens[CurrentToken].value;
                    CurrentToken++;
                    const old = CurrentToken;

                    switch (keyword) {
                        case "if":
                        case "while":
                        case "print":
                        case "return":
                            let tmp = this.AST(keyword, this.ASSIGNED_KEYWORD[keyword]);
                            let math = ParseMath();

                            if (!math)
                                CurrentToken = old;

                            tmp.Push(math);
                            CurrentAST.Push(tmp);
                            break;

                        case "else":
                            if (CurrentAST._Parent._Type != this.NODE_IF)
                                return this.ThrowLang(this.ERROR_SYNTAX, _Tokens[CurrentToken].value, _Tokens[CurrentToken].char);

                            let code = this.AST("body", this.NODE_BODY);
                            let condition = ParseMath();
                            if (condition == null)
                                CurrentToken = old;

                            CurrentAST._Parent.Push(condition || this.AST("1", this.NODE_NUMBER));
                            CurrentAST._Parent.Push(code);
                            CurrentAST = code;
                            break;

                        case "rem":
                        case "ask":
                            if (_Tokens[CurrentToken].type != this.TOKEN_NAME)
                                return this.ThrowLang(this.ERROR_SYNTAX, _Tokens[CurrentToken].value, _Tokens[CurrentToken].char);
                            CurrentAST.Push(this.AST(_Tokens[CurrentToken].value, this.ASSIGNED_KEYWORD[keyword]));
                            CurrentToken++;
                            break;

                        case "fn":
                            let fn = this.AST(_Tokens[CurrentToken].value, this.NODE_FUNCTION);
                            CurrentToken++;

                            if (_Tokens[CurrentToken].type != this.TOKEN_OPEN)
                                return this.ThrowLang(this.ERROR_SYNTAX, _Tokens[CurrentToken].value, _Tokens[CurrentToken].char);

                            CurrentToken++;
                            let arg = this.AST("arg", this.NODE_ARGVAR);

                            while (_Tokens[CurrentToken].type != this.TOKEN_CLOSE) {
                                if (_Tokens[CurrentToken].type != this.TOKEN_TYPE)
                                    return this.ThrowLang(this.ERROR_SYNTAX, _Tokens[CurrentToken].value, _Tokens[CurrentToken].char);
                                let arg_type = this.AST(_Tokens[CurrentToken].value, this.NODE_TYPE);
                                CurrentToken++;

                                if (_Tokens[CurrentToken].type != this.TOKEN_NAME)
                                    return this.ThrowLang(this.ERROR_SYNTAX, _Tokens[CurrentToken].value, _Tokens[CurrentToken].char);
                                arg.Push(this.AST(_Tokens[CurrentToken].value, this.NODE_STORE).Push(arg_type));
                                CurrentToken++;
                            }

                            fn.Push(arg);
                            CurrentAST.Push(fn);
                            CurrentToken++;
                            break;

                        case "{":
                            if (CurrentAST._Children.length == 0)
                                return this.ThrowLang(this.ERROR_SYNTAX, keyword, _Tokens[CurrentToken--].char);

                            let body = this.AST("body", this.NODE_BODY);
                            CurrentAST._Children[CurrentAST._Children.length - 1].Push(body);
                            CurrentAST = body;
                            break;

                        case "}":
                            if (CurrentAST._Parent == root)
                                return this.ThrowLang(this.ERROR_SYNTAX, keyword, _Tokens[CurrentToken--].char);

                            CurrentAST = CurrentAST._Parent._Parent;
                            break;

                        default:
                            return this.ThrowLang(this.ERROR_INTERPRETER, keyword, _Tokens[CurrentToken--].char);
                    }

                    break;

                case this.TOKEN_TYPE:
                    const type = _Tokens[CurrentToken].value;
                    CurrentToken++;

                    if (_Tokens[CurrentToken].type != this.TOKEN_NAME)
                        return this.ThrowLang(this.ERROR_SYNTAX, keyword, _Tokens[CurrentToken].char);

                    const variable = this.AST(_Tokens[CurrentToken].value, this.NODE_STORE);
                    CurrentToken++;
                    let oldtoken = CurrentToken;

                    variable.Push(this.AST(type, this.NODE_TYPE));
                    let math = ParseMath();

                    if (!math)
                        CurrentToken = oldtoken;

                    variable.Push(math);
                    CurrentAST.Push(variable);
                    break;

                case this.TOKEN_NAME:
                    let fn = ParseFunction();
                    if (fn == null || fn?._Type == this.NODE_GET)
                        return this.ThrowLang(this.ERROR_SYNTAX, keyword, _Tokens[CurrentToken].char);
                    CurrentAST.Push(fn);
                    break;

                default:
                    return this.ThrowLang(this.ERROR_SYNTAX, keyword, _Tokens[CurrentToken].char);
            }
        }

        return root;
    }

    /**
     * 
     * @param {AbstractSyntaxTree} _AST 
     */
    ParseAST(_AST) {
        switch (_AST?._Type) {
            case this.NODE_STRING:
                return { value: _AST._Value, arg: null };

            case this.NODE_NUMBER:
                return { value: parseFloat(_AST._Value) || 0, arg: null };

            case this.NODE_GET:
                const get = this.#mem_get(_AST._Value, _AST);
                return get != null ? { value: this.MEMORY[get].value, arg: this.MEMORY[get].arg } : { value: this.SYMBOL_NOTDEF, arg: null };

            case this.NODE_CALL:
                return { value: this.#mem_run(_AST._Value, _AST._Children[0], _AST), arg: null };

            case this.NODE_BODY:
                return { value: this.Execute(_AST) || this.SYMBOL_NULL, arg: null };

            case this.NODE_OPERATOR:
                const x = this.ParseAST(_AST._Children[0]).value;
                const y = this.ParseAST(_AST._Children[1]).value;

                try {
                    return {
                        value: eval(`${typeof x === "number" ? x : `"${x}"`} ${_AST._Value} ${typeof y === "number" ? y : `"${y}"`}`) || 0,
                        arg: null
                    };
                } catch { }

            default:
                return { value: 0, arg: null };
        }

    }

    /**
     * 
     * @param {string} _Type 
     * @param {any} _Value 
     */
    format(_Type, _Value) {
        switch (_Type) {
            case "integer":
                return parseInt(_Value) || 0;
            case "float":
                return parseFloat(_Value) || 0;
            case "string":
                return _Value.toString();
            case "$":
                return _Value;
            default:
                return this.SYMBOL_NULL;
        }
    }

    /**
     * 
     * @param {string} name 
     * @param {AbstractSyntaxTree} access 
     */
    #mem_get(name, access) {
        for (let i = 0; i < this.MEMORY.length + 1; i++)
            if (this.MEMORY[i] && this.MEMORY[i].name == name && access?.AsParent(this.MEMORY[i].access))
                return i;
        return null;
    }

    /**
     * 
     * @param {string} name 
     * @param {AbstractSyntaxTree} arg 
     * @param {AbstractSyntaxTree} access 
     */
    #mem_run(name, arg, access) {
        let get = this.#mem_get(name, access);

        if (get == null)
            return null;

        const fn = this.MEMORY[get].value;

        this.MEMORY[get]?.arg?._Children?.forEach(argname => {
            this.#mem_add(argname._Value, this.format(argname._Children[0]._Value, this.ParseAST(arg._Children[0]).value), null, fn);
            arg._Children[0]._Children.shift();
        });

        return this.Execute(fn);
    }

    /**
     * 
     * @param {string} name 
     * @param {any} value 
     * @param {AbstractSyntaxTree} arg 
     * @param {AbstractSyntaxTree} access 
     */
    #mem_add(name, value, arg, access) {
        let get = this.#mem_get(name, access);
        if (get != null) {
            this.MEMORY[get].value = value;
            this.MEMORY[get].arg = arg;
            return get;
        }
        return this.MEMORY.unshift({
            name: name,
            value: value,
            arg: arg,
            access: access
        });
    }

    /**
     * 
     * @param {AbstractSyntaxTree} _AST 
     */
    Execute(_AST) {

        if (!_AST)
            return;

        /**
         * @param {AbstractSyntaxTree} _AST 
         */
        const Next = (_AST, _CC) => {
            let next = _AST?._Parent;
            return next?._Children[_CC];
        };

        /**
         * @type {AbstractSyntaxTree}
         */
        let current = _AST._Children[0];
        let cc = 0;
        let tmp = null;

        while (current) {

            switch (current._Type) {
                case this.NODE_STORE:
                    tmp = this.ParseAST(current._Children[1]);
                    this.#mem_add(
                        current._Value,
                        this.format(current._Children[0]._Value, tmp.value),
                        tmp.arg,
                        current._Parent
                    );
                    break;

                case this.NODE_FUNCTION:
                    this.#mem_add(
                        current._Value,
                        current._Children[1],
                        current._Children[0],
                        current._Parent
                    );
                    break;

                case this.NODE_REMOVE:
                    tmp = this.#mem_get(current._Value, current._Parent);
                    if (tmp != null)
                        delete this.MEMORY[tmp];
                    break;

                case this.NODE_PROMPT:
                    this.#mem_add(
                        current._Value,
                        prompt(),
                        null,
                        current._Parent
                    );
                    break;

                case this.NODE_CALL:
                    this.#mem_run(current._Value, current._Children[0], current);
                    break;

                case this.NODE_IF:
                    let condition = 0;
                    for (; current._Children[condition] && !this.ParseAST(current._Children[condition]).value; condition += 2);;
                    tmp = this.Execute(current._Children[condition + 1]);
                    if (tmp != null)
                        return tmp;
                    break;

                case this.NODE_WHILE:
                    while (this.ParseAST(current._Children[0]).value) {
                        tmp = this.Execute(current._Children[1]);
                        if (tmp != null)
                            return tmp;
                    }
                    break;

                case this.NODE_OUTPUT:
                    this.out(this.ParseAST(current._Children[0]).value);
                    break;

                case this.NODE_RETURN:
                    return this.ParseAST(current._Children[0]).value;

                default:
                    break;
            }

            cc++;
            tmp = null;
            current = Next(current, cc);

        }

        return null;
    }

    run(_RawCode) {
        this.Execute(this.Parse(this.Tokenizer(_RawCode)));
    }

}

customElements.define("ldrx-run", LDRX);
