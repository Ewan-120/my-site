(() => {
  'use strict';

  const MAX_DIGITS = 15;
  const OPERATORS = new Set(['+', '-', '×', '÷']);

  const expressionEl = document.getElementById('expression');
  const resultEl = document.getElementById('result');
  const keysEl = document.querySelector('.keys');

  let expression = '';
  let justEvaluated = false;
  let hasError = false;
  let evaluatedFrom = null;

  /* ---------------- 分词与求值 ---------------- */

  function tokenize(src) {
    const tokens = [];
    let i = 0;

    while (i < src.length) {
      const ch = src[i];

      if (ch === ' ') {
        i += 1;
        continue;
      }

      if (ch === '(' || ch === ')') {
        tokens.push({ type: ch, value: ch });
        i += 1;
        continue;
      }

      if (OPERATORS.has(ch)) {
        tokens.push({ type: 'operator', value: ch });
        i += 1;
        continue;
      }

      if (/[0-9.]/.test(ch)) {
        let j = i;
        let dot = false;
        while (j < src.length && /[0-9.]/.test(src[j])) {
          if (src[j] === '.') {
            if (dot) throw new Error('invalid number');
            dot = true;
          }
          j += 1;
        }
        if (j < src.length && /[eE]/.test(src[j])) {
          let k = j + 1;
          if (src[k] === '+' || src[k] === '-') {
            k += 1;
          }
          const exponentStart = k;
          while (k < src.length && /[0-9]/.test(src[k])) {
            k += 1;
          }
          if (k === exponentStart) throw new Error('invalid exponent');
          j = k;
        }
        const value = Number(src.slice(i, j));
        if (!Number.isFinite(value)) throw new Error('invalid number');
        tokens.push({ type: 'number', value });
        i = j;
        continue;
      }

      throw new Error('unexpected character');
    }

    return tokens;
  }

  function evaluate(src) {
    const tokens = tokenize(src);
    let pos = 0;

    const peek = () => tokens[pos];
    const take = () => tokens[pos++];

    function parsePrimary() {
      const token = take();
      if (!token) throw new Error('unexpected end');

      if (token.type === '(') {
        const value = parseAdditive();
        const close = take();
        if (!close || close.type !== ')') throw new Error('missing )');
        return value;
      }

      if (token.type !== 'number') throw new Error('expected number');
      return token.value;
    }

    function parseUnary() {
      if (peek() && peek().type === 'operator' && peek().value === '-') {
        take();
        return -parseUnary();
      }
      return parsePrimary();
    }

    function parseTerm() {
      let value = parseUnary();
      while (
        peek() &&
        peek().type === 'operator' &&
        (peek().value === '×' || peek().value === '÷')
      ) {
        const op = take().value;
        const right = parseUnary();
        if (op === '÷' && right === 0) throw new Error('division by zero');
        value = op === '×' ? value * right : value / right;
      }
      return value;
    }

    function parseAdditive() {
      let value = parseTerm();
      while (
        peek() &&
        peek().type === 'operator' &&
        (peek().value === '+' || peek().value === '-')
      ) {
        const op = take().value;
        const right = parseTerm();
        value = op === '+' ? value + right : value - right;
      }
      return value;
    }

    const value = parseAdditive();
    if (pos !== tokens.length) throw new Error('unexpected token');
    return value;
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) throw new Error('not finite');
    if (value === 0) return '0';
    return String(Number(value.toPrecision(12)));
  }

  /* ---------------- 显示 ---------------- */

  function currentNumber() {
    return expression.match(/(\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/);
  }

  function formatExpression(expr) {
    if (!expr) return '';
    let out = '';
    for (let i = 0; i < expr.length; i += 1) {
      const char = expr[i];
      const prev = expr[i - 1];
      if (char === '-') {
        const unary = i === 0 || prev === '(' || OPERATORS.has(prev);
        out += unary ? '−' : ' − ';
      } else if (char === '+' || char === '×' || char === '÷') {
        out += ` ${char} `;
      } else {
        out += char;
      }
    }
    return out.trim();
  }

  function displayedEntry() {
    const current = currentNumber();
    if (!current) return '0';

    const minusIndex = current.index - 1;
    if (minusIndex >= 0 && expression[minusIndex] === '-') {
      const beforeMinus = expression[minusIndex - 1];
      if (beforeMinus === undefined || beforeMinus === '(' || OPERATORS.has(beforeMinus)) {
        return `-${current[0]}`;
      }
    }
    return current[0];
  }

  function render() {
    if (hasError) {
      expressionEl.textContent = formatExpression(expression);
      resultEl.textContent = '错误';
      return;
    }

    const showHistory = justEvaluated && evaluatedFrom;
    expressionEl.textContent = showHistory
      ? `${formatExpression(evaluatedFrom)} =`
      : formatExpression(expression);

    resultEl.textContent = showHistory ? expression : displayedEntry();
  }

  /* ---------------- 输入操作 ---------------- */

  function resetState() {
    expression = '';
    justEvaluated = false;
    hasError = false;
    evaluatedFrom = null;
    render();
  }

  function inputDigit(digit) {
    if (hasError) resetState();
    if (justEvaluated) {
      expression = '';
      justEvaluated = false;
      evaluatedFrom = null;
    }
    if (expression.endsWith(')')) return;

    const current = currentNumber();
    if (current) {
      const digits = current[0].replace(/[^0-9]/g, '');
      if (digits.length >= MAX_DIGITS) return;
      if (current[0] === '0') {
        expression = expression.slice(0, -1) + digit;
      } else {
        expression += digit;
      }
    } else {
      expression += digit;
    }
    render();
  }

  function inputDot() {
    if (hasError) resetState();
    if (justEvaluated) {
      expression = '';
      justEvaluated = false;
      evaluatedFrom = null;
    }
    if (expression.endsWith(')')) return;

    const current = currentNumber();
    if (current) {
      if (current[0].includes('.') || /[eE]/.test(current[0])) return;
      expression += '.';
    } else {
      expression += '0.';
    }
    render();
  }

  function inputOperator(op) {
    if (hasError || !expression) return;
    justEvaluated = false;
    evaluatedFrom = null;

    if (expression.endsWith(')')) {
      expression += op;
      render();
      return;
    }

    const last = expression.slice(-1);
    if (OPERATORS.has(last)) {
      expression = expression.slice(0, -1) + op;
    } else {
      expression += op;
    }
    render();
  }

  function inputPercent() {
    if (hasError) return;

    const current = currentNumber();
    if (!current) return;

    justEvaluated = false;
    evaluatedFrom = null;

    const value = Number(current[0]);
    if (!Number.isFinite(value)) return;

    let converted;
    try {
      converted = formatNumber(value / 100);
    } catch {
      return;
    }
    expression = expression.slice(0, current.index) + converted;
    render();
  }

  function toggleSign() {
    if (hasError) return;

    if (justEvaluated) {
      const value = Number(expression);
      if (!Number.isFinite(value)) return;
      expression = formatNumber(-value);
      justEvaluated = false;
      evaluatedFrom = null;
      render();
      return;
    }

    const current = currentNumber();
    if (!current) return;

    justEvaluated = false;
    evaluatedFrom = null;

    const before = expression.slice(0, current.index);
    if (before.endsWith('(-') && expression.endsWith(')')) {
      expression = before.slice(0, -2) + current[0];
    } else {
      expression = `${before}(-${current[0]})`;
    }
    render();
  }

  function backspace() {
    if (hasError) {
      resetState();
      return;
    }

    justEvaluated = false;
    evaluatedFrom = null;

    const wrapped = expression.match(
      /\((-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)\)$/
    );
    if (wrapped) {
      expression = expression.slice(0, wrapped.index) + wrapped[1];
    } else {
      expression = expression.slice(0, -1);
    }

    if (expression === '-' || expression.endsWith('(')) {
      expression = expression.slice(0, -1);
    }
    render();
  }

  function calculate() {
    if (hasError || !expression) return;

    const trimmed = expression.replace(/[+\-×÷]+$/, '');
    if (!trimmed) {
      resetState();
      return;
    }

    try {
      const value = evaluate(trimmed);
      if (!Number.isFinite(value)) throw new Error('not finite');
      expression = formatNumber(value);
      justEvaluated = true;
      evaluatedFrom = trimmed;
      render();
    } catch {
      hasError = true;
      justEvaluated = false;
      evaluatedFrom = null;
      render();
    }
  }

  /* ---------------- 事件绑定 ---------------- */

  const KEYMAP = {
    '+': ['operator', '+'],
    '-': ['operator', '-'],
    '*': ['operator', '×'],
    x: ['operator', '×'],
    X: ['operator', '×'],
    '/': ['operator', '÷'],
    '.': ['dot', ''],
    Enter: ['equals', ''],
    '=': ['equals', ''],
    Backspace: ['backspace', ''],
    Escape: ['clear', ''],
    c: ['clear', ''],
    C: ['clear', ''],
    '%': ['percent', ''],
  };

  function handleAction(action, value) {
    switch (action) {
      case 'digit':
        inputDigit(value);
        break;
      case 'dot':
        inputDot();
        break;
      case 'operator':
        inputOperator(value);
        break;
      case 'percent':
        inputPercent();
        break;
      case 'sign':
        toggleSign();
        break;
      case 'backspace':
        backspace();
        break;
      case 'clear':
        resetState();
        break;
      case 'equals':
        calculate();
        break;
      default:
        break;
    }
  }

  keysEl.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    handleAction(button.dataset.action, button.dataset.value);
  });

  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      inputDigit(event.key);
      return;
    }

    const mapped = KEYMAP[event.key];
    if (!mapped) return;
    event.preventDefault();
    handleAction(mapped[0], mapped[1]);
  });

  render();
})();
