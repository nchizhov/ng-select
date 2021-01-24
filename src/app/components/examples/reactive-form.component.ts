import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
declare var hljs: any;

import {OptionService} from '../../services/option.service';
import {IOption} from '../../../../projects/ng-select/src/lib/option.interface';

@Component({
    selector: 'reactive-form',
    templateUrl: 'reactive-form.component.html'
})
export class ReactiveForm implements OnInit, AfterViewInit {

    characters: Array<IOption> = this.optionService.getCharacters();
    defaultCharacter = '3';
    defaultCharacters: Array<string> = ['1', '3'];
    form0: FormGroup;
    form1: FormGroup;

    constructor(
        private elementRef: ElementRef,
        private optionService: OptionService
    ) {}

    ngOnInit() {
        this.form0 = new FormGroup({
            character: new FormControl(this.defaultCharacter)
        });
        this.form1 = new FormGroup({
            character: new FormControl(this.defaultCharacters)
        });
    }

    ngAfterViewInit() {
        hljs.initHighlighting();
        const nodes: NodeList = this.elementRef
            .nativeElement
            .querySelectorAll('.typescript, .html, .css');

        for (let i = 0; i < nodes.length; i++) {
            hljs.highlightBlock(nodes[i]);
        }
    }

    html0: string = `
<pre><code class="html">&lt;div&gt;
    &lt;span&gt;Form state: &lt;/span&gt;
    &lt;span *ngIf="form.get('character')?.dirty"&gt;dirty&lt;/span&gt;
    &lt;span *ngIf="form.get('character')?.pristine"&gt;pristine&lt;/span&gt;
    &lt;span&gt; &amp; &lt;/span&gt;
    &lt;span *ngIf="form.get('character')?.touched"&gt;touched&lt;/span&gt;
    &lt;span *ngIf="form.get('character')?.untouched"&gt;untouched&lt;/span&gt;
    &lt;div&gt;Form value: {{form.value | json}}&lt;/div&gt;
&lt;/div&gt;
&lt;form
    novalidate
    [formGroup]="form"&gt;
    &lt;ng-select
        formControlName="character"
        [allowClear]="true"
        [options]="characters"&gt;
    &lt;/ng-select&gt;
&lt;/form&gt;
</code></pre>`;

    ts0: string = `
<pre><code class="typescript">export class ReactiveFormExample {

    characters: Array&lt;IOption&gt; = this.optionService.getOptions();
    defaultCharacter: string = '3';

    constructor(
        private optionService: OptionService
    ) {}

    ngOnInit() {
        this.form = new FormGroup({
            character: new FormControl(this.defaultCharacter)
        });
    }
}
</pre></code>`;

    html1: string = `
<pre><code class="html">&lt;div&gt;
    &lt;span&gt;Form state: &lt;/span&gt;
    &lt;span *ngIf="form.get('character')?.dirty"&gt;dirty&lt;/span&gt;
    &lt;span *ngIf="form.get('character')?.pristine"&gt;pristine&lt;/span&gt;
    &lt;span&gt; &amp; &lt;/span&gt;
    &lt;span *ngIf="form.get('character')?.touched"&gt;touched&lt;/span&gt;
    &lt;span *ngIf="form.get('character')?.untouched"&gt;untouched&lt;/span&gt;
    &lt;div&gt;Form value: {{form.value | json}}&lt;/div&gt;
&lt;/div&gt;
&lt;form
    novalidate
    [formGroup]="form"&gt;
    &lt;ng-select
        formControlName="character"
        [allowClear]="true"
        [options]="characters"&gt;
    &lt;/ng-select&gt;
&lt;/form&gt;
</code></pre>`;

    ts1: string = `
<pre><code class="typescript">export class ReactiveFormExample {

    characters: Array&lt;IOption&gt; = this.optionService.getOptions();
    defaultCharacters: Array&lt;string&gt; = ['1', '3'];

    constructor(
        private optionService: OptionService
    ) {}

    ngOnInit() {
        this.form = new FormGroup({
            character: new FormControl(this.defaultCharacters)
        });
    }
}
</pre></code>`;

}
