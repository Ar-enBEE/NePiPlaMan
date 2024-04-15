import type { Writable } from 'svelte/store';
import { DLList } from '.';

interface UID {
	uid: string;
}

/**
 * Handles drag and drop functionality for a DLList of items.
 */
export default class DnDHandler<T extends UID> {
	list: DLList<T>;
	selection: Set<string> = new Set();
	selectionStore: Writable<Set<string>>;
	selectionStart: number | null;
	lastSelected: number | null;
	dragging: boolean = false;

	/**
	 * Constructs a new instance of the DnDHandler Drag and Drop handler class.
	 * @param list - The list of items to handle drag and drop for. Each item must have a unique 'uid' property
	 * and be rendered as a list item with an id attribute set to the item's 'uid'.
	 * @param selectionStore - The writable store for managing the selection state.
	 */
	constructor(list: DLList<T>, selectionStore: Writable<Set<string>>) {
		this.list = list;
		this.selectionStart = null;
		this.lastSelected = null;

		this.selectionStore = selectionStore;
		selectionStore.set(new Set());
		selectionStore.subscribe((value) => (this.selection = value));

		this.clearSelection = this.clearSelection.bind(this);
		this.handleCtrlClick = this.handleCtrlClick.bind(this);
		this.handleShiftClick = this.handleShiftClick.bind(this);
		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleDrag = this.handleDrag.bind(this);
		this.handleDrop = this.handleDrop.bind(this);
		this.handleDragEnter = this.handleDragEnter.bind(this);
		this.handleDragLeave = this.handleDragLeave.bind(this);
		this.scrollPage = this.scrollPage.bind(this);
	}

	/**
	 * Clears the current selection.
	 */
	clearSelection() {
		this.selection = new Set();
		this.selectionStore.set(this.selection);
		this.selectionStart = null;
		this.lastSelected = null;
	}

	/**
	 * Handles the Ctrl+Click event for selecting or deselecting an item.
	 * @param event - The MouseEvent object representing the Ctrl+Click event.
	 */
	handleCtrlClick(event: MouseEvent) {
		if (!event.ctrlKey || event.shiftKey) return;
		event.preventDefault();
		event.stopPropagation();

		const clickedId = (<HTMLElement>event.target).closest('li')?.id;
		if (!clickedId) return;

		if (this.selection.has(clickedId)) this.selection.delete(clickedId);
		else this.selection.add(clickedId);

		this.selectionStore.set(this.selection);
		this.lastSelected = this.list.map((item) => String(item.uid)).indexOf(clickedId);
	}

	/**
	 * Handles the Shift+Click event. Selects a range of items between the last selected item and the clicked item.
	 *
	 * @param event - The MouseEvent object representing the Shift+Click event.
	 */
	handleShiftClick(event: MouseEvent) {
		if (!event.shiftKey || event.ctrlKey) return;
		event.preventDefault();
		event.stopPropagation();

		const clickedId = (<HTMLElement>event.target).closest('li')?.id;
		if (!clickedId) return;

		const clickedIndex = this.list.indexOf((item) => String(item.uid) === clickedId);
		if (this.lastSelected == null) this.lastSelected = clickedIndex;
		const start = Math.min(this.lastSelected, clickedIndex);
		const end = Math.max(this.lastSelected, clickedIndex);
		this.list.slice(start, end + 1).map((item) => this.selection.add(String(item.uid)));
		this.selectionStore.set(this.selection);
		this.lastSelected = clickedIndex;
	}

	/**
	 * Handles the drag start event.
	 * @param event - The drag event.
	 */
	handleDragStart(event: DragEvent) {
		const draggedId = (<HTMLElement>event.target).closest('li')?.id;
		if (!draggedId) return;
		if (!this.selection.has(draggedId)) this.selection = new Set([draggedId]);
		this.selectionStore.set(this.selection);
		this.selectionStart = this.list.indexOf((item) => this.selection.has(String(item.uid)));
		this.selectionStart = this.selectionStart === -1 ? null : this.selectionStart;
	}

	/**
	 * Handles the drag event. Scrolls the page if the dragged item is near the top or bottom of the window.
	 * @param event - The drag event object.
	 */
	handleDrag(event: DragEvent) {
		this.dragging = false;
		if (event.clientY < 150) {
			this.dragging = true;
			this.scrollPage(-1);
		} else if (event.clientY > window.innerHeight - 150) {
			this.dragging = true;
			this.scrollPage(1);
		}
	}

	/**
	 * Handles the drop event when an item is dropped onto the target element.
	 * @param event - The DragEvent object representing the drop event.
	 */
	handleDrop(event: DragEvent) {
		event.preventDefault();
		this.dragging = false;
		const dropTarget = (<HTMLElement>event.target).closest('li');
		const dropId = dropTarget?.id;
		if (dropId === undefined || this.selectionStart === null) return;

		const selected = this.list.filter((item) => this.selection.has(String(item.uid)));
		const rest = this.list.filter((item) => !this.selection.has(String(item.uid)));
		let dropIndex = rest.indexOf((item) => String(item.uid) === dropId);
		dropTarget?.classList.remove('border-t-4');
		dropTarget?.classList.remove('border-b-4');
		if (dropIndex === -1) return;
		if (dropIndex >= this.selectionStart) dropIndex += 1;

		this.list.clear();
		this.list.insert(0, rest);
		this.list.insert(dropIndex, selected);

		this.selection = new Set();
		this.selectionStore.set(this.selection);
		this.selectionStart = null;
		this.lastSelected = null;
	}

	/**
	 * Handles the drag enter event.
	 *
	 * @param event - The drag event.
	 */
	handleDragEnter(event: DragEvent) {
		event.preventDefault();
		const enterElement = (<HTMLElement>event.target).closest('li');
		if (!enterElement || this.selectionStart === null) return;

		const enterIndex = this.list.indexOf((item) => String(item.uid) === enterElement.id);

		enterElement.classList.add(enterIndex > this.selectionStart ? 'border-b-4' : 'border-t-4');
	}

	/**
	 * Handles the drag leave event.
	 *
	 * @param event - The drag event.
	 */
	handleDragLeave(event: DragEvent) {
		event.preventDefault();
		const itemClassList = (<HTMLElement>event.target).closest('li')?.classList;
		itemClassList?.remove('border-t-4');
		itemClassList?.remove('border-b-4');
	}

	/**
	 * Scrolls the page by a specified step.
	 * @param step - The amount by which to scroll the page.
	 */
	scrollPage(step: number) {
		const scrollY = window.scrollY;
		window.scrollTo({ top: scrollY + step, behavior: 'instant' });
		if (this.dragging) setTimeout(() => this.scrollPage(step), 20);
	}
}
