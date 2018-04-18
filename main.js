var simplexApp = new Vue({
    el: '#simplexApp',
    data: {
        highlights: {
            //!!!!!!!!!!!!!! ДОБАВИТЬ КРУЖКИ ПЕРЕХОДА ПО ШАГАМ
            //step        v-if  steps[].helight == true
            /*
            this.highlights.push({
                row: last_row,
                col: selected_col,
                step: steps.length
            })*/
            cell: [],
            row: [],
            col: []
        },
        state_matr: 0
    },
    methods: {

        highlighted_cell: function (step_id, row_id, col_id) {
            //return step_id > 0 && this.highlights[step_id - 1].row === row_id && this.highlights[step_id - 1].col === col_id
            return this.highlights.some((element) => {
                if (element.row === row_id && element.col === col_id && element.step === step_id) return true;
            }) && true;
        },
        highlighted_row: function (step_id, row_id, col_id) {
            return step_id > 0 && this.highlights[step_id - 1].row === row_id
        },
        highlighted_col: function (step_id, row_id, col_id) {
            return step_id > 0 && this.highlights[step_id - 1].col === col_id
        }
    },
    computed: {
        //хранит шаги перехода от одной симплекс таблице к другой
        steps: function () {
            let steps = [];
            const BAZIS = 0, H = 1, B = 6, X = 2;//столбцы матрицы
            let first_matrix = [
                //                     s1  s2 - в другой литре
                // базиc, H   x1  x2  x3  x4  B
                [3, 2, -1, 1, 1, 0, 0],
                [4, 10, 5, 2, 0, -1, 0],
                ['C', ' ', 1, -5, 0, 0]
            ];
            resolving_el= { row: 0, col: 0, val: 0 } // разрешающий элемент
            let tmp;//временная матрица для произведения вычислений
            //
            tmp = copyMatr(first_matrix);
            tmp.name_action = 'скопировал начальные данные, для вывода исходных данных';
            steps.push(tmp);
            // 
            tmp = copyMatr(first_matrix);
            tmp.name_action = 'Выбираем в последней строке наибольшее (по модулю) отрицательное число ';
            let last_row = tmp.length - 1;
            let min = tmp[last_row][1];
            min = tmp[last_row].reduce((min, current, index) => {
                if (typeof current == 'number' && current < min) return current;
                return min;
            }, min);
            resolving_el.col = tmp[last_row].indexOf(min);
            
            steps.push(tmp);
            //
            tmp = copyMatr(tmp);
            tmp.name_action = 'Вычислим b = Н / Элементы_выбранного_столбца';
            for (let i = 0; i < tmp.length; i++)
                if (typeof tmp[i][B] == 'number')
                    tmp[i][B] = tmp[i][H] / tmp[i][resolving_el.col];
            steps.push(tmp);
            //
            tmp = copyMatr(tmp);
            tmp.name_action = 'Среди вычисленных значений b выбираем наименьшее. \
            Пересечение выбранных столбца и строки даст нам разрешающий элемент.';
            min = tmp[0][B];
            for (let i = 0; i < tmp.length; i++)
                if (typeof tmp[i][B] == 'number')
                    if (tmp[i][B] < min) min = tmp[i][B];
            steps.push(tmp);
            //
            tmp = copyMatr(tmp);
            tmp.name_action = 'Меняем базис на переменную соответствующую разрешающему элементу ';
            for (let i = 0; i < tmp.length; i++)
                if (tmp[i][B] == min)
                    resolving_el.row = i;
            tmp[resolving_el.row][BAZIS] = resolving_el.col-1; //преебразуем jстолбец (X1)  в данные удобные для прользователя
            steps.push(tmp);
            //
            tmp = copyMatr(tmp);
            tmp.name_action = 'Теперь необходимо пересчитать все элементы симплекс-таблицы, кроме столбца b. \
            Вот как это можно сделать: \
            (1)Сам разрешающий элемент обращается в 1. \
            (2)Для элементов разрешающей строки – aij(*) = aij / РЭ  \
            (то есть каждый элемент делим на значение разрешающего элемента и получаем новые данные). \
            (3)Для элементов разрешающего столбца – они просто обнуляются. \
            (4)Остальные элементы таблицы пересчитываем по правилу прямоугольника.';
            resolving_el.val = tmp[resolving_el.row][resolving_el.col]; //записываем значение разреш элемента
            
            tmp[resolving_el.row][resolving_el.col] = 1;//(1)
            tmp[resolving_el.row] = tmp[resolving_el.row].map((element, index) => {
                if (index >= X && index != resolving_el.col && index != tmp[0].length-1) return element / resolving_el.val;
                return element;
            });//(2)
            for(let i = 0; i < tmp.length; i++){
                if(i != resolving_el.row) tmp[i][resolving_el.col] = 0;
            }//(3)
            for(let i = resolving_el.row+1; i < tmp.length; i++){
                for(let j = resolving_el.col+1; j < tmp[0].length-1; j++){
                    tmp[i][j] = tmp[i][j] - (tmp[resolving_el.row][j] * tmp[i][resolving_el.col]/resolving_el.val);
                }
            }//(4)
            steps.push(tmp);
            return steps;
        }
    }
});
function copyMatr(matrix) {
    //копирует матрицы
    return matrix.map(e => {
        if (e instanceof Array)
            return e.map(v => v);
        return e;
    });
} 
