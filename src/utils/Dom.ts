import {Utils} from '../utils/Utils';
import {Assert} from '../misc/Assert';
import {Logger} from '../misc/Logger';

export interface IOffset {
  left: number;
  top: number;
}

/**
 * This is essentially an helper class for dom manipulation.<br/>
 * This is intended to provide some basic functionality normally offered by jQuery.<br/>
 * To minimize the multiple jQuery conflict we have while integrating in various system, we implemented the very small subset that the framework needs.<br/>
 * See {@link $$}, which is a function that wraps this class constructor, for less verbose code.
 */
export class Dom {
  private static CLASS_NAME_REGEX = /-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g;
  private static ONLY_WHITE_SPACE_REGEX = /^\s*$/;

  public el: HTMLElement;

  /**
   * Create a new Dom object with the given HTMLElement
   * @param el The HTMLElement to wrap in a Dom object
   */
  constructor(el: HTMLElement) {
    Assert.exists(el);
    this.el = el;
  }

  private static handlers: { eventHandle: Function, fn: EventListener }[] = [];

  /**
   * Helper function to quickly create an HTMLElement
   * @param type The type of the element (e.g. div, span)
   * @param props The props (id, className, attributes) of the element<br/>
   * Can be either specified in dashed-case strings ('my-attribute') or camelCased keys (myAttribute),
   * the latter of which will automatically get replaced to dash-case.
   * @param innerHTML The contents of the new HTMLElement, either in string form or as another HTMLElement
   */
  static createElement(type: string, props?: Object, ...children: Array<string | HTMLElement | Dom>): HTMLElement {
    var elem: HTMLElement = document.createElement(type);

    for (var key in props) {
      if (key === 'className') {
        elem.className = props['className'];
      } else {
        let attr = key.indexOf('-') !== -1 ? key : Utils.toDashCase(key);
        elem.setAttribute(attr, props[key]);
      }
    }

    _.each(children, (child: string | HTMLElement | Dom) => {
      if (child instanceof HTMLElement) {
        elem.appendChild(child);
      } else if (_.isString(child)) {
        elem.innerHTML += child;
      } else if (child instanceof Dom) {
        elem.appendChild(child.el);
      }
    });

    return elem;
  }

  /**
   * Adds the element to the children of the current element
   * @param element The element to append
   * @returns {string}
   */
  public append(element: HTMLElement) {
    this.el.appendChild(element);
  }

  /**
   * Get the css value of the specified property.<br/>
   * @param property The property
   * @returns {string}
   */
  public css(property: string): string {
    if (this.el.style[property]) {
      return this.el.style[property];
    }
    return window.getComputedStyle(this.el).getPropertyValue(property);
  }

  /**
   * Get or set the text content of the HTMLElement.<br/>
   * @param txt Optional. If given, this will set the text content of the element. If not, will return the text content.
   * @returns {string}
   */
  public text(txt?: string): string {
    if (Utils.isUndefined(txt)) {
      return this.el.innerText || this.el.textContent;
    } else {
      if (this.el.innerText != undefined) {
        this.el.innerText = txt;
      } else if (this.el.textContent != undefined) {
        this.el.textContent = txt;
      }
    }
  }

  /**
   * Performant way to transform a NodeList to an array of HTMLElement, for manipulation<br/>
   * http://jsperf.com/nodelist-to-array/72
   * @param nodeList a {NodeList} to convert to an array
   * @returns {HTMLElement[]}
   */
  public nodeListToArray(nodeList: NodeList): HTMLElement[] {
    var i = nodeList.length;
    var arr: HTMLElement[] = new Array(i);
    while (i--) {
      arr[i] = <HTMLElement>nodeList.item(i);
    }
    return arr;
  }

  /**
   * Empty (remove all child) from the element;
   */
  public empty(): void {
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }
  }

  /**
   * Empty the element and all childs from the dom;
   */
  public remove(): void {
    this.el.parentNode.removeChild(this.el);
  }

  /**
   * Show the element;
   */
  public show(): void {
    this.el.style.display = 'block';
  }

  /**
   * Hide the element;
   */
  public hide(): void {
    this.el.style.display = 'none';
  }

  /**
   * Toggle the element visibility.<br/>
   * Optional visible parameter, if specified will set the element visibility
   * @param visible Optional parameter to display or hide the element
   */
  public toggle(visible?: boolean): void {
    if (visible === undefined) {
      if (this.el.style.display == 'block') {
        this.hide();
      } else {
        this.show();
      }
    } else {
      if (visible) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  /**
   * Returns the value of the specified attribute.
   * @param name The name of the attribute
   */
  public getAttribute(name: string): string {
    return this.el.getAttribute(name);
  }

  /**
   * Sets the value of the specified attribute.
   * @param name The name of the attribute
   * @param value The value to set
   */
  public setAttribute(name: string, value: string) {
    this.el.setAttribute(name, value);
  }

  /**
   * Find a child element, given a CSS selector
   * @param selector A CSS selector, can be a .className or #id
   * @returns {HTMLElement}
   */
  public find(selector: string): HTMLElement {
    return <HTMLElement>this.el.querySelector(selector);
  }

  /**
   * Check if the element match the selector.<br/>
   * The selector can be a class, an id or a tag.<br/>
   * Eg : .is('.foo') or .is('#foo') or .is('div').
   */
  public is(selector: string): boolean {
    if (this.el.tagName.toLowerCase() == selector.toLowerCase()) {
      return true;
    }
    if (selector[0] == '.') {
      if (this.hasClass(selector.substr(1))) {
        return true;
      }
    }

    if (selector[0] == '#') {
      if (this.el.getAttribute('id') == selector.substr(1)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get the first element that matches the classname by testing the element itself and traversing up through its ancestors in the DOM tree.<br/>
   * Stops at the body of the document
   * @param className A CSS classname
   */
  public closest(className: string): HTMLElement {
    if (className.indexOf('.') == 0) {
      className = className.substr(1);
    }
    var current = this.el, found = false;
    while (!found) {
      if ($$(current).hasClass(className)) {
        found = true;
      }
      if (current.tagName.toLowerCase() == 'body') {
        break;
      }
      if (current.parentElement == null) {
        break;
      }
      if (!found) {
        current = current.parentElement;
      }
    }
    if (found) {
      return current;
    }
    return undefined;
  }

  /**
   * Return all children
   * @returns {HTMLElement[]}
   */
  public children(): HTMLElement[] {
    return this.nodeListToArray(this.el.children);
  }

  /**
   * Return all siblings
   * @returns {HTMLElement[]}
   */
  public siblings(selector: string): HTMLElement[] {
    let sibs = [];
    let currentElement = <HTMLElement>this.el.parentNode.firstChild;
    for (; currentElement; currentElement = <HTMLElement>currentElement.nextSibling) {
      if (currentElement != this.el) {
        if (this.matches(currentElement, selector) || !selector) {
          sibs.push(currentElement);
        }
      }
    }
    return sibs;
  }

  private matches(element: HTMLElement, selector: string) {
    var all = document.querySelectorAll(selector);
    for (var i = 0; i < all.length; i++) {
      if (all[i] === element) {
        return true;
      }
    }
    return false;
  }

  /**
   * Find all children that match the given CSS selector
   * @param selector A CSS selector, can be a .className
   * @returns {HTMLElement[]}
   */
  public findAll(selector: string): HTMLElement[] {
    return this.nodeListToArray(this.el.querySelectorAll(selector));
  }

  /**
   * Find the child elements using a className
   * @param className Class of the childs elements to find
   * @returns {HTMLElement[]}
   */
  public findClass(className: string): HTMLElement[] {
    if ('getElementsByClassName' in this.el) {
      return this.nodeListToArray(this.el.getElementsByClassName(className));
    }
    // For ie 8
    return this.nodeListToArray(this.el.querySelectorAll('.' + className));
  }

  /**
   * Find an element using an ID
   * @param id ID of the element to find
   * @returns {HTMLElement}
   */
  public findId(id: string): HTMLElement {
    return document.getElementById(id);
  }

  /**
   * Add a class to the element. Takes care of not adding the same class if the element already has it.
   * @param className Classname to add to the element
   */
  public addClass(classNames: string[]): void;
  public addClass(className: string): void;
  public addClass(className: any): void {
    if (_.isArray(className)) {
      _.each(className, (name: string) => {
        this.addClass(name);
      });
    } else {
      if (!this.hasClass(className)) {
        if (this.el.className) {
          this.el.className += ' ' + className;
        } else {
          this.el.className = className;
        }
      }
    }
  }

  /**
   * Remove the class on the element. Works even if the element does not possess the class.
   * @param className Classname to remove on the the element
   */
  public removeClass(className: string): void {
    this.el.className = this.el.className.replace(new RegExp(`(^|\\s)${className}(\\s|\\b)`, 'g'), '$1').trim();
  }

  /**
   * Toggle the class on the element.
   * @param className Classname to toggle
   * @swtch If true, add the class regardless and if false, remove the class
   */
  public toggleClass(className: string, swtch?: boolean): void {
    if (Utils.isNullOrUndefined(swtch)) {
      if (this.hasClass(className)) {
        this.removeClass(className);
      } else {
        this.addClass(className);
      }
    } else {
      if (swtch) {
        this.addClass(className);
      } else {
        this.removeClass(className);
      }
    }
  }

  /**
   * Sets the inner html of the element
   * @param html The html to set
   */
  public setHtml(html: string) {
    this.el.innerHTML = html;
  }

  /**
   * Return an array with all the classname on the element. Empty array if the element has not classname
   * @returns {any|Array}
   */
  public getClass(): string[] {
    return this.el.className.match(Dom.CLASS_NAME_REGEX) || [];
  }

  /**
   * Check if the element has the given class name
   * @param className Classname to verify
   * @returns {boolean}
   */
  public hasClass(className: string): boolean {
    return _.contains(this.getClass(), className);
  }

  /**
   * Detach the element from the DOM.
   */
  public detach(): void {
    this.el.parentElement && this.el.parentElement.removeChild(this.el);
  }

  /**
   * Insert the current node after the given reference node
   * @param refNode
   */
  public insertAfter(refNode: HTMLElement): void {
    refNode.parentNode && refNode.parentNode.insertBefore(this.el, refNode.nextSibling);
  }

  /**
   * Insert the current node before the given reference node
   * @param refNode
   */
  public insertBefore(refNode: HTMLElement): void {
    refNode.parentNode && refNode.parentNode.insertBefore(this.el, refNode);
  }

  /**
   * Insert the given node as the first child of the current node
   * @param toPrepend
   */
  public prepend(toPrepend: HTMLElement) {
    if (this.el.firstChild) {
      new Dom(toPrepend).insertBefore(<HTMLElement>this.el.firstChild);
    } else {
      this.el.appendChild(toPrepend);
    }
  }

  /**
   * Bind an event handler on the element. Accepts either one (a string) or multiple (Array<String>) event type.<br/>
   * @param types The {string} or {Array<String>} of types on which to bind an event handler
   * @param eventHandle The function to execute when the event is triggered
   */
  public on(types: string[], eventHandle: (evt: Event, data: any) => void): void;
  public on(type: string, eventHandle: (evt: Event, data: any) => void): void;
  public on(type: any, eventHandle: (evt: Event, data: any) => void): void {
    if (_.isArray(type)) {
      _.each(type, (t: string) => {
        this.on(t, eventHandle);
      });
    } else {
      var jq = this.getJQuery();
      if (jq) {
        jq(this.el).on(type, eventHandle);
      } else if (this.el.addEventListener) {
        var fn = (e: CustomEvent) => {
          eventHandle(e, e.detail);
        };
        Dom.handlers.push({
          eventHandle: eventHandle,
          fn: fn
        });
        this.el.addEventListener(type, fn, false);
      } else if (this.el['on']) {
        this.el['on']('on' + type, eventHandle);
      }
    }
  }

  /**
   * Bind an event handler on the element. Accepts either one (a string) or multiple (Array<String>) event type.<br/>
   * The event handler will execute only ONE time.
   * @param types The {string} or {Array<String>} of types on which to bind an event handler
   * @param eventHandle The function to execute when the event is triggered
   */
  public one(types: string[], eventHandle: (evt: Event, args?: any) => void): void;
  public one(type: string, eventHandle: (evt: Event, args?: any) => void): void;
  public one(type: any, eventHandle: (evt: Event, args?: any) => void): void {
    if (_.isArray(type)) {
      _.each(type, (t: string) => {
        this.one(t, eventHandle);
      });
    } else {
      var once = (e: Event, args: any) => {
        this.off(type, once);
        return eventHandle(e, args);
      };
      this.on(type, once);
    }
  }

  /**
   * Remove an event handler on the element. Accepts either one (a string) or multiple (Array<String>) event type.<br/>
   * @param types The {string} or {Array<String>} of types on which to remove an event handler
   * @param eventHandle The function to remove on the element
   */
  public off(types: string[], eventHandle: (evt: Event, arg?: any) => void): void;
  public off(type: string, eventHandle: (evt: Event, arg?: any) => void): void;
  public off(type: any, eventHandle: (evt: Event, arg?: any) => void): void {
    if (_.isArray(type)) {
      _.each(type, (t: string) => {
        this.off(t, eventHandle);
      });
    } else {
      var jq = this.getJQuery();
      if (jq) {
        jq(this.el).off(type, eventHandle);
      } else if (this.el.removeEventListener) {
        var idx = 0;
        var found = _.find(Dom.handlers, (handlerObj: { eventHandle: Function, fn: EventListener }, i) => {
          if (handlerObj.eventHandle == eventHandle) {
            idx = i;
            return true;
          }
        });
        if (found) {
          this.el.removeEventListener(type, found.fn, false);
          Dom.handlers.splice(idx, 1);
        }
      } else if (this.el['off']) {
        this.el['off']('on' + type, eventHandle);
      }
    }
  }

  /**
   * Trigger an event on the element.
   * @param type The event type to trigger
   * @param data
   */
  public trigger(type: string, data?: { [key: string]: any }): void {
    var jq = this.getJQuery();
    if (jq) {
      jq(this.el).trigger(type, data);
    } else if (CustomEvent !== undefined) {
      var event = new CustomEvent(type, { detail: data, bubbles: true });
      this.el.dispatchEvent(event);
    } else {
      // TODO Support for older browser ?
      new Logger(this).error('CANNOT TRIGGER EVENT FOR OLDER BROWSER');
    }
  }

  /**
   * Check if the element is "empty" (has no innerHTML content). Whitespace is considered empty</br>
   * @returns {boolean}
   */
  public isEmpty(): boolean {
    return Dom.ONLY_WHITE_SPACE_REGEX.test(this.el.innerHTML);
  }

  /**
   * Check if the element is a descendant of parent
   * @param other
   */
  public isDescendant(parent: HTMLElement): boolean {
    var node = this.el.parentNode;
    while (node != null) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  /**
   * Replace the current element with the other element, then detach the current element
   * @param otherElem
   */
  public replaceWith(otherElem: HTMLElement): void {
    var parent = this.el.parentNode;
    if (parent) {
      new Dom(otherElem).insertAfter(this.el);
    }
    this.detach();
  }

  // based on http://api.jquery.com/position/
  /**
   * Return the position relative to the offset parent.
   */
  public position(): IOffset {
    let offsetParent = this.offsetParent();
    let parentOffset: IOffset = { top: 0, left: 0 };

    let offset = this.offset();
    if (!$$(offsetParent).is('html')) {
      parentOffset = $$(offsetParent).offset();
    }

    let borderTopWidth = parseInt($$(offsetParent).css('borderTopWidth'));
    let borderLeftWidth = parseInt($$(offsetParent).css('borderLeftWidth'));
    borderTopWidth = isNaN(borderTopWidth) ? 0 : borderTopWidth;
    borderLeftWidth = isNaN(borderLeftWidth) ? 0 : borderLeftWidth;

    parentOffset = {
      top: parentOffset.top + borderTopWidth,
      left: parentOffset.left + borderLeftWidth
    };

    let marginTop = parseInt(this.css('marginTop'));
    let marginLeft = parseInt(this.css('marginLeft'));
    marginTop = isNaN(marginTop) ? 0 : marginTop;
    marginLeft = isNaN(marginLeft) ? 0 : marginLeft;

    return {
      top: offset.top - parentOffset.top - marginTop,
      left: offset.left - parentOffset.left - marginLeft
    };
  }

  // based on https://api.jquery.com/offsetParent/
  /**
   * Returns the offset parent. The offset parent is the closest parent that is positioned.
   * An element is positioned when its position property is not 'static', which is the default.
   */
  public offsetParent(): HTMLElement {
    let offsetParent = this.el.offsetParent;

    while (offsetParent instanceof HTMLElement && $$(offsetParent).css('position') === 'static') {
      // Will break out if it stumbles upon an non-HTMLElement and return documentElement
      offsetParent = (<HTMLElement>offsetParent).offsetParent;
    }

    if (!(offsetParent instanceof HTMLElement)) {
      return document.documentElement;
    }
    return <HTMLElement>offsetParent;
  }

  // based on http://api.jquery.com/offset/
  /**
   * Return the position relative to the document.
   */
  public offset(): IOffset {
    // In <=IE11, calling getBoundingClientRect on a disconnected node throws an error
    if (!this.el.getClientRects().length) {
      return { top: 0, left: 0 };
    }


    let rect = this.el.getBoundingClientRect();

    if (rect.width || rect.height) {
      let doc = this.el.ownerDocument;
      let docElem = doc.documentElement;

      return {
        top: rect.top + window.pageYOffset - docElem.clientTop,
        left: rect.left + window.pageXOffset - docElem.clientLeft
      };
    }
    return rect;
  }

  /**
   * Returns the offset width of the element
   */
  public width() {
    return this.el.offsetWidth;
  }

  /**
   * Returns the offset height of the element
   */
  public height() {
    return this.el.offsetHeight;
  }

  private getJQuery() {
    if (window['jQuery'] != undefined) {
      return window['jQuery'];
    }
    return false;
  }

}

export class Win {
  constructor(public win: Window) {
  }

  public height(): number {
    return this.win.innerHeight;
  }

  public width(): number {
    return this.win.innerWidth;
  }
}

export class Doc {
  constructor(public doc: Document) {
  }

  public height(): number {
    var body = this.doc.body;
    return Math.max(body.scrollHeight, body.offsetHeight);
  }

  public width(): number {
    var body = this.doc.body;
    return Math.max(body.scrollWidth, body.offsetWidth);
  }
}

/**
 * Convenience wrapper for the {@link Dom} class. Used to do $$(element).<br/>
 * If passed with an argument which is not an HTMLElement, it will call {@link Dom.createElement}.
 * @param el The HTMLElement to wrap in a Dom object
 * @param type See {@link Dom.createElement}
 * @param props See {@link Dom.createElement}
 * @param ...children See {@link Dom.createElement}
 */
export function $$(dom: Dom): Dom;
export function $$(html: HTMLElement): Dom;
export function $$(type: string, props?: Object, ...children: Array<string | HTMLElement | Dom>): Dom;
export function $$(...args: any[]): Dom {
  if (args.length === 1 && args[0] instanceof Dom) {
    return args[0];
  } else if (args.length === 1 && (!_.isString(args[0]))) {
    return new Dom(<HTMLElement>args[0]);
  } else {
    return new Dom(Dom.createElement.apply(Dom, args));
  }
}

export function htmlToDom(html: string): Element {
  var parsedHtml = document.createElement('div');
  parsedHtml.innerHTML = html;
  // If the template has a single root element, we return it directly. Otherwise
  // we'll have to wrap this thing in a div as ResultList expects a single element.
  if (parsedHtml.children.length == 1) {
    return parsedHtml.children.item(0);
  }
  return parsedHtml;
}
