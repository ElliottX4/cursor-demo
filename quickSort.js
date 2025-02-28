/**
 * 基础版快速排序
 * @param {Array} arr - 需要排序的数组
 * @returns {Array} - 排序后的数组
 */
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[0];
    const left = [];
    const right = [];
    
    // 将数组分成两部分
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < pivot) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }
    
    return [...quickSort(left), pivot, ...quickSort(right)];
}

/**
 * 优化版快速排序（原地排序）
 * @param {Array} arr - 需要排序的数组
 * @param {number} left - 左边界
 * @param {number} right - 右边界
 * @returns {Array} - 排序后的数组
 */
function quickSortOptimized(arr, left = 0, right = arr.length - 1) {
    if (left < right) {
        const pivotIndex = partition(arr, left, right);
        quickSortOptimized(arr, left, pivotIndex - 1);
        quickSortOptimized(arr, pivotIndex + 1, right);
    }
    return arr;
}

/**
 * 分区函数
 * @param {Array} arr - 需要分区的数组
 * @param {number} left - 左边界
 * @param {number} right - 右边界
 * @returns {number} - 基准元素的最终位置
 */
function partition(arr, left, right) {
    // 使用三数取中法选择基准
    const mid = Math.floor((left + right) / 2);
    const pivotIndex = medianOfThree(arr, left, mid, right);
    swap(arr, pivotIndex, right);
    
    const pivot = arr[right];
    let i = left - 1;
    
    for (let j = left; j < right; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr, i, j);
        }
    }
    
    swap(arr, i + 1, right);
    return i + 1;
}

/**
 * 三数取中法
 * @param {Array} arr - 数组
 * @param {number} left - 左边界
 * @param {number} mid - 中间位置
 * @param {number} right - 右边界
 * @returns {number} - 中间值的索引
 */
function medianOfThree(arr, left, mid, right) {
    const a = arr[left];
    const b = arr[mid];
    const c = arr[right];
    
    if ((a - b) * (c - a) >= 0) return left;
    if ((b - a) * (c - b) >= 0) return mid;
    return right;
}

/**
 * 交换数组中两个元素的位置
 * @param {Array} arr - 数组
 * @param {number} i - 第一个位置
 * @param {number} j - 第二个位置
 */
function swap(arr, i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
}

// 测试代码
const testArray = [64, 34, 25, 12, 22, 11, 90];
console.log('原始数组:', testArray);
console.log('基础快排结果:', quickSort([...testArray]));
console.log('优化快排结果:', quickSortOptimized([...testArray]));

// 性能测试
function performanceTest() {
    const largeArray = Array.from({length: 100000}, () => Math.floor(Math.random() * 1000000));
    
    console.time('基础快排');
    quickSort([...largeArray]);
    console.timeEnd('基础快排');
    
    console.time('优化快排');
    quickSortOptimized([...largeArray]);
    console.timeEnd('优化快排');
}

// 运行性能测试
performanceTest(); 