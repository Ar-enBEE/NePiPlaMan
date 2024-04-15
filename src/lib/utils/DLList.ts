/**
 * Represents a node in a DLList.
 */
export class DLNode<T> {
	public data: T;
	public next: DLNode<T> | null;
	public prev: DLNode<T> | null;

	/**
	 * Creates a new instance of the DLNode class.
	 * @param data - The data to be stored in the node.
	 */
	constructor(data: T) {
		this.data = data;
		this.next = null;
		this.prev = null;
	}
}

/**
 * My custom doubly-linked list implementation.
 */
export default class DLList<T> {
	private _head: DLNode<T> | null;
	private _tail: DLNode<T> | null;
	private _size: number;

	/**
	 * DLList constructor.
	 * @param array - Optional array to initialize the list with.
	 */
	constructor(array: T[] = []) {
		this._head = null;
		this._tail = null;
		this._size = 0;
		if (array.length > 0) this.fromArray(array);
	}

	/**
	 * A getter for the number of elements in the DLList.
	 * @returns The number of elements in the list.
	 */
	get size(): number {
		return this._size;
	}

	/**
	 * A getter for the head node of the DLList.
	 * @throws If the DLList is empty.
	 * @returns The value of the head node.
	 */
	get head(): T {
		if (!this._head) throw new Error('DLList is empty');
		return this._head.data;
	}

	/**
	 * A getter for the tail node of the DLList.
	 * @throws If the DLList is empty.
	 * @returns The value of the tail node.
	 */
	get tail(): T {
		if (!this._tail) throw new Error('DLList is empty');
		return this._tail.data;
	}

	/**
	 * Retrieves the element at the specified index.
	 *
	 * @param index - The index of the element to retrieve.
	 * @returns The element at the specified index.
	 * @throws If the index is out of range.
	 */
	at(index: number): DLNode<T> {
		if (index < 0 || index >= this._size) {
			throw new Error('DLList index out of range');
		}
		let current = this._head;
		for (let i = 0; i < index; i++) {
			current = current!.next;
		}
		return current!;
	}

	/**
	 * Adds a new node with the specified data to the end of the DLList.
	 * @param data The data to be added to the list.
	 * @returns void
	 */
	push(data: T): void {
		const newNode = new DLNode(data);
		if (!this._head) {
			this._head = newNode;
			this._tail = newNode;
		} else {
			this._tail!.next = newNode;
			newNode.prev = this._tail;
			this._tail = newNode;
		}
		this._size++;
	}

	/**
	 * Inserts a new node with the specified data at the head of the DLList.
	 * @param data The data to be inserted.
	 * @returns void
	 */
	pushHead(data: T): void {
		const newNode = new DLNode(data);
		if (!this._head) {
			this._head = newNode;
			this._tail = newNode;
		} else {
			newNode.next = this._head;
			this._head!.prev = newNode;
			this._head = newNode;
		}
		this._size++;
	}

	/**
	 * Inserts an element or another DLList at the specified index.
	 * If `dataOrList` is a DLList, the elements of the list are inserted starting at the specified index.
	 * If `dataOrList` is an element, it is inserted at the specified index.
	 * @param index - The index at which to insert the element or list.
	 * @param dataOrList - The element or DLList to insert.
	 * @throws - Throws an error if the index is out of range.
	 */
	insert(index: number, data: T): void;
	insert(index: number, list: DLList<T>): void;
	insert(index: number, dataOrList: T | DLList<T>): void {
		if (index < 0 || index > this._size) {
			throw new Error('DLList index out of range');
		}
		// Insert a DLList
		if (dataOrList instanceof DLList) {
			const list = dataOrList as DLList<T>;
			if (list.isEmpty() || list === this) return;
			if (this.isEmpty()) {
				this._head = list._head;
				this._tail = list._tail;
			} else if (index === 0) {
				list._tail!.next = this._head;
				this._head!.prev = list._tail;
				this._head = list._head;
			} else if (index === this._size) {
				this._tail!.next = list._head;
				list._head!.prev = this._tail;
				this._tail = list._tail;
			} else {
				const begin = this.at(index - 1);
				const end = begin.next;
				begin.next = list._head;
				list._head!.prev = begin;
				end!.prev = list._tail;
				list._tail!.next = end;
			}
			this._size += list._size;
			list._head = null;
			list._tail = null;
			list._size = 0;
			return;
		}
		// Insert an element
		const data = dataOrList as T;
		const newNode = new DLNode(data);
		if (index === 0) {
			this.pushHead(data);
		} else if (index === this._size) {
			this.push(data);
		} else {
			let current = this._head;
			for (let i = 0; i < index - 1; i++) {
				current = current!.next;
			}
			newNode.next = current!.next;
			newNode.prev = current;
			current!.next!.prev = newNode;
			current!.next = newNode;
			this._size++;
		}
	}

	/**
	 * Removes and returns the last element from the DLList.
	 * Throws an error if the list is empty.
	 *
	 * @returns The last element of the list.
	 * @throws Error if the list is empty.
	 */
	pop(): T {
		if (!this._tail) throw new Error('DLList is empty');
		const data = this._tail.data;
		if (this._size === 1) {
			this._head = null;
			this._tail = null;
		} else {
			this._tail = this._tail.prev;
			this._tail!.next = null;
		}
		this._size--;
		return data;
	}

	/**
	 * Removes and returns the data stored in the head node of the DLList.
	 * Throws an error if the list is empty.
	 * @returns The data stored in the head node.
	 * @throws Error if the list is empty.
	 */
	popHead(): T {
		if (!this._head) throw new Error('DLList is empty');
		const data = this._head.data;
		if (this._size === 1) {
			this._head = null;
			this._tail = null;
		} else {
			this._head = this._head.next;
			this._head!.prev = null;
		}
		this._size--;
		return data;
	}

	/**
	 * Deletes the element at the specified index from the DLList.
	 *
	 * @param index - The index of the element to delete.
	 * @returns The deleted element.
	 * @throws Error if the index is out of range.
	 */
	delete(index: number): T {
		if (index < 0 || index >= this._size) {
			throw new Error('DLList index out of range');
		}
		if (index === 0) return this.popHead();
		if (index === this._size - 1) return this.pop();
		const current = this.at(index);
		current.prev!.next = current.next;
		current.next!.prev = current.prev;
		this._size--;
		return current.data;
	}

	/**
	 * Clears the DLList.
	 */
	clear(): void {
		this._head = null;
		this._tail = null;
		this._size = 0;
	}

	/**
	 * Populates the DLList with elements from an array.
	 * @param array - The array containing the elements to be added to the list.
	 */
	fromArray(array: T[]) {
		for (const item of array) {
			this.push(item);
		}
	}

	/**
	 * Converts the DLList to an array.
	 * @returns An array containing all the elements in the DLList.
	 */
	toArray(): T[] {
		const returnArray = [];
		for (const item of this) returnArray.push(item);
		return returnArray;
	}

	/**
	 * Returns a new DLList containing a portion of the original DLList.
	 * @param start - The starting index (inclusive) of the slice.
	 * @param end - The ending index (exclusive) of the slice.
	 * @returns A new DLList containing the sliced elements.
	 * @throws If the start or end index is out of range.
	 */
	slice(start: number, end: number): DLList<T> {
		if (start < 0 || start >= this._size || end < 0 || end > this._size) {
			throw new Error('DLList index out of range');
		}
		const returnList = new DLList<T>();
		let current = this._head;
		for (let i = 0; i < start; i++) {
			current = current!.next;
		}
		for (let i = start; i < end; i++) {
			returnList.push(current!.data);
			current = current!.next;
		}
		return returnList;
	}

	/**
	 * Returns the index of the first occurrence of a specified element in the DLList.
	 * If the element is not found, returns -1.
	 *
	 * @param dataOrCallback - The element to search for or a callback function that determines the search condition.
	 * @returns The index of the first occurrence of the element, or -1 if not found.
	 */
	indexOf(data: T): number;
	indexOf(callbackFn: (value: T) => boolean): number;
	indexOf(dataOrCallback: T | ((value: T) => boolean)): number {
		let current = this._head;
		let index = 0;
		while (current) {
			if (typeof dataOrCallback === 'function') {
				const callback = dataOrCallback as (value: T) => boolean;
				if (callback(current.data)) return index;
			} else {
				if (current.data === dataOrCallback) return index;
			}
			current = current.next;
			index++;
		}
		return -1;
	}

	/**
	 * Finds the first element in the DLList that satisfies the provided callback function.
	 *
	 * @param callbackFn - The callback function used to test each element in the list.
	 *                     It should return `true` if the element satisfies the condition, `false` otherwise.
	 * @returns The first element that satisfies the condition specified by the callback function, or `null` if no such element is found.
	 */
	find(callbackFn: (value: T) => boolean): T | null {
		let current = this._head;
		while (current) {
			if (callbackFn(current.data)) return current.data;
			current = current.next;
		}
		return null;
	}

	/**
	 * Creates a new DLList by applying the provided mapping function to each element of the current DLList.
	 *
	 * @param mapFn A mapping function that transforms each element of the current DLList.
	 *              It takes two parameters: the value of the element and its index in the DLList.
	 * @returns A new DLList containing the transformed elements.
	 */
	map<U>(mapFn: (value: T, index: number) => U): DLList<U> {
		const returnList = new DLList<U>();
		for (const item of this) returnList.push(mapFn(item, returnList.size));
		return returnList;
	}

	/**
	 * Filters the elements of the list based on the provided callback function.
	 * @param callbackFn - The callback function used to test each element of the list.
	 *                     Should return `true` to include the element in the filtered list, or `false` to exclude it.
	 * @returns A new `DLList` containing the elements that pass the test implemented by the callback function.
	 */
	filter(callbackFn: (value: T) => boolean): DLList<T> {
		const returnList = new DLList<T>();
		for (const item of this) if (callbackFn(item)) returnList.push(item);
		return returnList;
	}

	/**
	 * Reverses the order of the elements in the DLList.
	 */
	reverse(): void {
		let current = this._head;
		while (current) {
			const temp = current.next;
			current.next = current.prev;
			current.prev = temp;
			current = temp;
		}
		const temp = this._head;
		this._head = this._tail;
		this._tail = temp;
	}

	/**
	 * Checks if the DLList is empty.
	 * @returns True if the list is empty, false otherwise.
	 */
	isEmpty(): boolean {
		return this._size === 0;
	}

	/**
	 * Prints the data of each node in the DLList.
	 */
	print(): void {
		let current = this._head;
		while (current) {
			console.log(current.data);
			current = current.next;
		}
	}

	*[Symbol.iterator](): Iterator<T> {
		let current = this._head;
		while (current) {
			yield current.data;
			current = current.next;
		}
	}
}
