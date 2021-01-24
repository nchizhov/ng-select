import {
    Component, HostListener, Input, OnChanges, OnInit, Output, EventEmitter, ExistingProvider, ViewChild, ViewEncapsulation,
    forwardRef, ElementRef, SimpleChanges, ContentChild, TemplateRef, AfterViewInit
} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';

import {SelectDropdownComponent} from './select-dropdown.component';
import {IOption} from './option.interface';
import {Option} from './option';
import {OptionList} from './option-list';

export const SELECT_VALUE_ACCESSOR: ExistingProvider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true
};

@Component({
    selector: 'ng-select',
    templateUrl: 'select.component.html',
    styleUrls: ['select.component.scss'],
    providers: [SELECT_VALUE_ACCESSOR],
    encapsulation: ViewEncapsulation.None
})

export class SelectComponent implements ControlValueAccessor, OnChanges, OnInit, AfterViewInit {

    // Data input.
    @Input() options: Array<IOption> = [];

    // Functionality settings.
    @Input() allowClear = false;
    @Input() disabled = false;
    @Input() multiple = false;
    @Input() noFilter = 0;

    // Style settings.
    @Input() highlightColor: string;
    @Input() highlightTextColor: string;
    @Input() hideSelected = false;

    // Text settings.
    @Input() notFoundMsg = 'No results found';
    @Input() placeholder = '';
    @Input() filterPlaceholder = '';
    @Input() label = '';

    // Output events.
    @Output() opened = new EventEmitter<null>();
    @Output() closed = new EventEmitter<null>();
    @Output() selected = new EventEmitter<IOption>();
    @Output() deselected = new EventEmitter<IOption | IOption[]>();
    @Output() focus = new EventEmitter<null>();
    @Output() blur = new EventEmitter<null>();
    @Output() noOptionsFound = new EventEmitter<string>();
    @Output() filterInputChanged = new EventEmitter<string>();
    @Output() clearSingleSelection = new EventEmitter<void>();

    @ViewChild('selection', { static: true }) selectionSpan: ElementRef;
    @ViewChild('dropdown', { static: false }) dropdown: SelectDropdownComponent;
    @ViewChild('filterInput', { static: false }) filterInput: ElementRef;

    @ContentChild('optionTemplate', /* TODO: add static flag */ {}) optionTemplate: TemplateRef<any>;

    private _value: Array<any> = [];
    optionList: OptionList = new OptionList([]);

    // View state variables.
    hasFocus = false;
    isOpen = false;
    isBelow = true;

    filterEnabled = true;
    filterInputWidth = 1;
    private isDisabled = false;
    placeholderView = '';

    private clearClicked = false;
    private selectContainerClicked = false;
    private optionListClicked = false;
    private optionClicked = false;

    // Width and position for the dropdown container.
    width: number;
    top: number;
    left: number;

    private onChange = (_: any) => {};
    private onTouched = () => {};

    constructor(
        private hostElement: ElementRef
    ) {}

    /** Event handlers. **/

    ngOnInit() {
        this.placeholderView = this.placeholder;
    }

    ngOnChanges(changes: SimpleChanges) {
        this.handleInputChanges(changes);
    }

    ngAfterViewInit() {
        this.updateState();
    }

    @HostListener('window:blur')
    onWindowBlur() {
        this._blur();
    }

    @HostListener('window:click')
    onWindowClick() {
        if (!this.selectContainerClicked &&
            (!this.optionListClicked || (this.optionListClicked && this.optionClicked))) {
            this.closeDropdown(this.optionClicked);
            if (!this.optionClicked) {
                this._blur();
            }
        }
        this.clearClicked = false;
        this.selectContainerClicked = false;
        this.optionListClicked = false;
        this.optionClicked = false;
    }

    @HostListener('window:resize')
    onWindowResize() {
        this.updateWidth();
    }

    onSelectContainerClick(event: any) {
        this.selectContainerClicked = true;
        if (!this.clearClicked) {
            this.toggleDropdown();
        }
    }

    onSelectContainerFocus() {
        this._focus();
    }

    onSelectContainerKeydown(event: any) {
        this.handleSelectContainerKeydown(event);
    }

    onOptionsListClick() {
        this.optionListClicked = true;
    }

    onDropdownOptionClicked(option: Option) {
        this.optionClicked = true;
        this.multiple ? this.toggleSelectOption(option) : this.selectOption(option);
    }

    onSingleFilterClick() {
        this.selectContainerClicked = true;
    }

    onSingleFilterFocus() {
        this._focus();
    }

    onFilterInput(term: string) {
        this.filterInputChanged.emit(term);
        this.filter(term);
    }

    onSingleFilterKeydown(event: any) {
        this.handleSingleFilterKeydown(event);
    }

    onMultipleFilterKeydown(event: any) {
        this.handleMultipleFilterKeydown(event);
    }

    onMultipleFilterFocus() {
        this._focus();
    }

    onClearSelectionClick(event: any) {
        this.clearClicked = true;
        this.clearSelection();
        this.closeDropdown(true);
        this.clearSingleSelection.emit();
    }

    onDeselectOptionClick(option: Option) {
        this.clearClicked = true;
        this.deselectOption(option);
    }

    /** API. **/

    // TODO fix issues with global click/key handler that closes the dropdown.
    open() {
        this.openDropdown();
    }

    close() {
        this.closeDropdown(false);
    }

    clear() {
        this.clearSelection();
    }

    select(value: string | Array<string>) {
        this.writeValue(value);
    }

    /** ControlValueAccessor interface methods. **/

    writeValue(value: any) {
        this.value = value;
    }

    registerOnChange(fn: (_: any) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void) {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    /** Input change handling. **/

    private handleInputChanges(changes: SimpleChanges) {
        const optionsChanged: boolean = changes.hasOwnProperty('options');
        const noFilterChanged: boolean = changes.hasOwnProperty('noFilter');
        const placeholderChanged: boolean = changes.hasOwnProperty('placeholder');

        if (optionsChanged) {
            this.updateOptionList(changes.options.currentValue);
            this.updateState();
        }
        if (optionsChanged || noFilterChanged) {
            this.updateFilterEnabled();
        }
        if (placeholderChanged) {
            this.updateState();
        }
    }

    private updateOptionList(options: Array<IOption>) {
        this.optionList = new OptionList(options);
        this.optionList.value = this._value;
    }

    private updateFilterEnabled() {
        this.filterEnabled = this.optionList.options.length >= this.noFilter;
    }

    /** Value. **/

    get value(): string | string[] {
        return this.multiple ? this._value : this._value[0];
    }

    set value(v: string | string[]) {
        if (typeof v === 'undefined' || v === null) {
            v = [];
        } else if (typeof v === 'string' || !Array.isArray(v)) {
            v = [v];
        }

        this.optionList.value = v;
        this._value = v;
        this.updateState();
    }

    private valueChanged() {
        this._value = this.optionList.value;
        this.updateState();
        this.onChange(this.value);
    }

    private updateState() {
        this.placeholderView = this.optionList.hasSelected ? '' : this.placeholder;
        setTimeout(() => {
            this.updateFilterWidth();
        });
    }

    /** Select. **/

    private selectOption(option: Option) {
        if (!option.selected && !option.disabled) {
            this.optionList.select(option, this.multiple);
            this.valueChanged();
            this.selected.emit(option.wrappedOption);
        }
    }

    private deselectOption(option: Option) {
        if (!option.selected) {
            return;
        }
        this.optionList.deselect(option);
        this.valueChanged();
        this.deselected.emit(option.wrappedOption);

        setTimeout(() => {
            if (this.multiple) {
                this.updatePosition();
                this.optionList.highlight();
                if (this.isOpen) {
                    this.dropdown.moveHighlightedIntoView();
                }
            }
        });
    }

    private clearSelection() {
        const selection: Array<Option> = this.optionList.selection;
        if (selection.length > 0) {
            this.optionList.clearSelection();
            this.valueChanged();

            if (selection.length === 1) {
                this.deselected.emit(selection[0].wrappedOption);
            } else {
                this.deselected.emit(selection.map(option => option.wrappedOption));
            }
        }
    }

    private toggleSelectOption(option: Option) {
        option.selected ? this.deselectOption(option) : this.selectOption(option);
    }

    private selectHighlightedOption() {
        const option: Option = this.optionList.highlightedOption;
        if (option !== null) {
            this.selectOption(option);
            this.closeDropdown(true);
        }
    }

    private deselectLast() {
        const sel: Array<Option> = this.optionList.selection;

        if (sel.length > 0) {
            const option: Option = sel[sel.length - 1];
            this.deselectOption(option);
            this.setMultipleFilterInput(option.label + ' ');
        }
    }

    /** Dropdown. **/

    private toggleDropdown() {
        if (!this.isDisabled) {
            this.isOpen ? this.closeDropdown(true) : this.openDropdown();
        }
    }

    private openDropdown() {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;
        this.updateWidth();
        setTimeout(() => {
            this.updatePosition();
            if (this.multiple && this.filterEnabled) {
                this.filterInput.nativeElement.focus();
            }
            this.opened.emit(null);
        });
    }

    private closeDropdown(focus: boolean) {
        if (!this.isOpen) {
            return;
        }
        this.clearFilterInput();
        this.updateFilterWidth();
        this.isOpen = false;
        if (focus) {
            this._focusSelectContainer();
        }
        this.closed.emit(null);
    }

    /** Filter. **/

    private filter(term: string) {
        if (this.multiple) {
            if (!this.isOpen) {
                this.openDropdown();
            }
            this.updateFilterWidth();
        }
        setTimeout(() => {
            const hasShown: boolean = this.optionList.filter(term);
            if (!hasShown) {
                this.noOptionsFound.emit(term);
            }
        });
    }

    private clearFilterInput() {
        if (this.multiple && this.filterEnabled) {
            this.filterInput.nativeElement.value = '';
        }
    }

    private setMultipleFilterInput(value: string) {
        if (this.filterEnabled) {
            this.filterInput.nativeElement.value = value;
        }
    }

    /** Keys. **/

    private KEYS: any = {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        ESC: 27,
        SPACE: 32,
        UP: 38,
        DOWN: 40
    };

    private handleSelectContainerKeydown(event: any) {
        const key = event.which;

        if (this.isOpen) {
            if (key === this.KEYS.ESC || (key === this.KEYS.UP && event.altKey)) {
                this.closeDropdown(true);
            } else if (key === this.KEYS.TAB) {
                this.closeDropdown(event.shiftKey);
                this._blur();
            } else if (key === this.KEYS.ENTER) {
                this.selectHighlightedOption();
            } else if (key === this.KEYS.UP) {
                this.optionList.highlightPreviousOption();
                this.dropdown.moveHighlightedIntoView();
                if (!this.filterEnabled) {
                    event.preventDefault();
                }
            } else if (key === this.KEYS.DOWN) {
                this.optionList.highlightNextOption();
                this.dropdown.moveHighlightedIntoView();
                if (!this.filterEnabled) {
                    event.preventDefault();
                }
            }
        } else {
            // DEPRECATED --> SPACE
            if (key === this.KEYS.ENTER || key === this.KEYS.SPACE ||
                    (key === this.KEYS.DOWN && event.altKey)) {

                /* FIREFOX HACK:
                 *
                 * The setTimeout is added to prevent the enter keydown event
                 * to be triggered for the filter input field, which causes
                 * the dropdown to be closed again.
                 */
                setTimeout(() => { this.openDropdown(); });
            } else if (key === this.KEYS.TAB) {
                this._blur();
            }
        }

    }

    private handleMultipleFilterKeydown(event: any) {
        const key = event.which;

        if (key === this.KEYS.BACKSPACE) {
            if (this.optionList.hasSelected && this.filterEnabled &&
                    this.filterInput.nativeElement.value === '') {
                this.deselectLast();
            }
        }
    }

    private handleSingleFilterKeydown(event: any) {
        const key = event.which;

        if (key === this.KEYS.ESC || key === this.KEYS.TAB
                || key === this.KEYS.UP || key === this.KEYS.DOWN
                || key === this.KEYS.ENTER) {
            this.handleSelectContainerKeydown(event);
        }
    }

    /** View. **/

    _blur() {
        if (!this.hasFocus) {
            return;
        }
        this.hasFocus = false;
        this.onTouched();
        this.blur.emit(null);
    }

    _focus() {
        if (this.hasFocus) {
            return;
        }
        this.hasFocus = true;
        this.focus.emit(null);
    }

    _focusSelectContainer() {
        this.selectionSpan.nativeElement.focus();
    }

    private updateWidth() {
        this.width = this.selectionSpan.nativeElement.getBoundingClientRect().width;
    }

    private updatePosition() {
        if (typeof this.dropdown === 'undefined') {
            return;
        }
        const hostRect = this.hostElement.nativeElement.getBoundingClientRect();
        const spanRect = this.selectionSpan.nativeElement.getBoundingClientRect();
        const dropRect = this.dropdown.hostElement.nativeElement.firstElementChild.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const top = spanRect.top - hostRect.top;
        const bottom = hostRect.bottom + dropRect.height;

        this.isBelow = bottom < windowHeight;
        this.left = spanRect.left - hostRect.left;
        this.top = this.isBelow ? top + spanRect.height : top - dropRect.height;
    }

    updateFilterWidth() {
        if (typeof this.filterInput === 'undefined') {
            return;
        }
        const value: string = this.filterInput.nativeElement.value;
        this.filterInputWidth = value.length === 0 ?
            1 + this.placeholderView.length * 10 : 1 + value.length * 10;
    }

    getFilterWidth(): string {
        return this.filterInputWidth.toString(10);
    }
}
