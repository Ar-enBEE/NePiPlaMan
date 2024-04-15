import { DLList } from '.';

/**
 * Sorts a DLList using the merge sort algorithm.
 *
 * @param list - The DLList to be sorted.
 * @param sortFn - The comparison function used to determine the order of elements.
 * If it returns true, the first element should come before the second element.
 * @returns - The sorted DLList.
 */
function MergeSort<T>(list: DLList<T>, sortFn: (a: T, b: T) => boolean): DLList<T> {
	if (list.size <= 1) return list;
	// Split the list into two halves
	const left = list.slice(0, Math.floor(list.size / 2));
	const right = list.slice(Math.floor(list.size / 2), list.size);
	// Recursively sort the two halves
	return merge(MergeSort(left, sortFn), MergeSort(right, sortFn), sortFn);
}

/**
 * Merges two DLLists into a single sorted DLList.
 */
function merge<T>(left: DLList<T>, right: DLList<T>, sortFn: (a: T, b: T) => boolean): DLList<T> {
	const mergedList = new DLList<T>();
	// Merge the two lists element by element until one is empty
	while (left.size > 0 && right.size > 0) {
		if (sortFn(left.head, right.head)) {
			mergedList.push(left.popHead());
		} else {
			mergedList.push(right.popHead());
		}
	}
	// Add any remaining elements
	while (left.size > 0) {
		mergedList.push(left.popHead());
	}
	while (right.size > 0) {
		mergedList.push(right.popHead());
	}
	return mergedList;
}

export default MergeSort;
