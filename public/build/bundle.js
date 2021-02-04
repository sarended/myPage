
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.28.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\views\SimpleCV.svelte generated by Svelte v3.28.0 */

    const { console: console_1 } = globals;
    const file = "src\\views\\SimpleCV.svelte";

    function create_fragment(ctx) {
    	let div8;
    	let div7;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let h1;
    	let t2;
    	let div1;
    	let input0;
    	let t3;
    	let input1;
    	let t4;
    	let input2;
    	let t5;
    	let input3;
    	let t6;
    	let span0;
    	let t7;
    	let span1;
    	let t8;
    	let div6;
    	let div2;
    	let h30;
    	let t10;
    	let p0;
    	let t12;
    	let img1;
    	let img1_src_value;
    	let t13;
    	let div3;
    	let h31;
    	let t15;
    	let p1;
    	let t17;
    	let img2;
    	let img2_src_value;
    	let t18;
    	let div4;
    	let h32;
    	let t20;
    	let p2;
    	let t22;
    	let img3;
    	let img3_src_value;
    	let t23;
    	let div5;
    	let h33;
    	let t25;
    	let p3;
    	let t26;
    	let a;
    	let t28;
    	let img4;
    	let img4_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div7 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Saeed Raisi";
    			t2 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t3 = space();
    			input1 = element("input");
    			t4 = space();
    			input2 = element("input");
    			t5 = space();
    			input3 = element("input");
    			t6 = space();
    			span0 = element("span");
    			t7 = space();
    			span1 = element("span");
    			t8 = space();
    			div6 = element("div");
    			div2 = element("div");
    			h30 = element("h3");
    			h30.textContent = "About Me";
    			t10 = space();
    			p0 = element("p");
    			p0.textContent = "Hello! My name is Saeed Raisi. I am a front-end developer and\r\n          javaScript obsessor. I also do like to do various things from reading\r\n          ancient things to making weird things. BTW this webpage is under\r\n          development and I'll add other things to it whenever I'm free. :D";
    			t12 = space();
    			img1 = element("img");
    			t13 = space();
    			div3 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Programming";
    			t15 = space();
    			p1 = element("p");
    			p1.textContent = "My main programming language is JavaScript/TypeScript(React, Svelte,\r\n          Electron, Three) but I also code other stuff: python(OpenCV, PyTorch,\r\n          Tensorflow), C++(Unreal Engine), C#(.net core, Unity), WASM.";
    			t17 = space();
    			img2 = element("img");
    			t18 = space();
    			div4 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Designing";
    			t20 = space();
    			p2 = element("p");
    			p2.textContent = "I have an infinite love for everything visual. I work with Adobe\r\n          Photoshop, Adobe Illustrator, Adobe AfterEffects, Autodesk SketchBook,\r\n          Autodesk Maya, Autodesk 3Ds Max, ZBrush, and Moho.";
    			t22 = space();
    			img3 = element("img");
    			t23 = space();
    			div5 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Contact Me";
    			t25 = space();
    			p3 = element("p");
    			t26 = text("You can always contact me via\r\n          ");
    			a = element("a");
    			a.textContent = "email";
    			t28 = space();
    			img4 = element("img");
    			attr_dev(img0, "class", "logo svelte-1kzmttz");
    			if (img0.src !== (img0_src_value = "/images/sarended_dark.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "sarended logo");
    			add_location(img0, file, 209, 6, 4279);
    			attr_dev(h1, "class", "main_title svelte-1kzmttz");
    			add_location(h1, file, 210, 6, 4359);
    			attr_dev(div0, "class", "title svelte-1kzmttz");
    			add_location(div0, file, 208, 4, 4252);
    			attr_dev(input0, "name", "navigation");
    			attr_dev(input0, "id", "nav1");
    			attr_dev(input0, "class", "bullet svelte-1kzmttz");
    			attr_dev(input0, "type", "radio");
    			input0.checked = "checked";
    			attr_dev(input0, "href", "#nav1");
    			add_location(input0, file, 213, 6, 4449);
    			attr_dev(input1, "name", "navigation");
    			attr_dev(input1, "id", "nav2");
    			attr_dev(input1, "class", "bullet svelte-1kzmttz");
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "href", "#nav2");
    			add_location(input1, file, 221, 6, 4637);
    			attr_dev(input2, "name", "navigation");
    			attr_dev(input2, "id", "nav3");
    			attr_dev(input2, "class", "bullet svelte-1kzmttz");
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "href", "#nav3");
    			add_location(input2, file, 228, 6, 4798);
    			attr_dev(input3, "name", "navigation");
    			attr_dev(input3, "id", "nav4");
    			attr_dev(input3, "class", "bullet svelte-1kzmttz");
    			attr_dev(input3, "type", "radio");
    			attr_dev(input3, "href", "#nav4");
    			add_location(input3, file, 235, 6, 4959);
    			attr_dev(div1, "class", "bullet_pack svelte-1kzmttz");
    			add_location(div1, file, 212, 4, 4416);
    			attr_dev(span0, "class", "light_mode");
    			add_location(span0, file, 243, 4, 5130);
    			attr_dev(span1, "class", "lang");
    			add_location(span1, file, 244, 4, 5163);
    			add_location(h30, file, 247, 8, 5242);
    			attr_dev(p0, "class", "svelte-1kzmttz");
    			add_location(p0, file, 248, 8, 5269);
    			if (img1.src !== (img1_src_value = "../images/slides1.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "image1");
    			attr_dev(img1, "class", "svelte-1kzmttz");
    			add_location(img1, file, 254, 8, 5603);
    			attr_dev(div2, "id", "sc1");
    			attr_dev(div2, "class", "svelte-1kzmttz");
    			add_location(div2, file, 246, 6, 5218);
    			add_location(h31, file, 257, 8, 5697);
    			attr_dev(p1, "class", "svelte-1kzmttz");
    			add_location(p1, file, 258, 8, 5727);
    			if (img2.src !== (img2_src_value = "../images/slides2.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "image2");
    			attr_dev(img2, "class", "svelte-1kzmttz");
    			add_location(img2, file, 263, 8, 5987);
    			attr_dev(div3, "id", "sc2");
    			attr_dev(div3, "class", "svelte-1kzmttz");
    			add_location(div3, file, 256, 6, 5673);
    			add_location(h32, file, 266, 8, 6081);
    			attr_dev(p2, "class", "svelte-1kzmttz");
    			add_location(p2, file, 267, 8, 6109);
    			if (img3.src !== (img3_src_value = "../images/slides3.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "image3");
    			attr_dev(img3, "class", "svelte-1kzmttz");
    			add_location(img3, file, 272, 8, 6356);
    			attr_dev(div4, "id", "sc3");
    			attr_dev(div4, "class", "svelte-1kzmttz");
    			add_location(div4, file, 265, 6, 6057);
    			add_location(h33, file, 275, 8, 6450);
    			attr_dev(a, "href", "mailto:sarended@gmail.com");
    			attr_dev(a, "class", "svelte-1kzmttz");
    			add_location(a, file, 278, 10, 6535);
    			attr_dev(p3, "class", "svelte-1kzmttz");
    			add_location(p3, file, 276, 8, 6479);
    			if (img4.src !== (img4_src_value = "../images/slides4.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "image4");
    			attr_dev(img4, "class", "svelte-1kzmttz");
    			add_location(img4, file, 280, 8, 6604);
    			attr_dev(div5, "id", "sc4");
    			attr_dev(div5, "class", "svelte-1kzmttz");
    			add_location(div5, file, 274, 6, 6426);
    			attr_dev(div6, "class", "slider svelte-1kzmttz");
    			add_location(div6, file, 245, 4, 5190);
    			attr_dev(div7, "class", "container svelte-1kzmttz");
    			add_location(div7, file, 207, 2, 4223);
    			attr_dev(div8, "class", "page svelte-1kzmttz");
    			add_location(div8, file, 206, 0, 4201);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t0);
    			append_dev(div0, h1);
    			append_dev(div7, t2);
    			append_dev(div7, div1);
    			append_dev(div1, input0);
    			append_dev(div1, t3);
    			append_dev(div1, input1);
    			append_dev(div1, t4);
    			append_dev(div1, input2);
    			append_dev(div1, t5);
    			append_dev(div1, input3);
    			append_dev(div7, t6);
    			append_dev(div7, span0);
    			append_dev(div7, t7);
    			append_dev(div7, span1);
    			append_dev(div7, t8);
    			append_dev(div7, div6);
    			append_dev(div6, div2);
    			append_dev(div2, h30);
    			append_dev(div2, t10);
    			append_dev(div2, p0);
    			append_dev(div2, t12);
    			append_dev(div2, img1);
    			append_dev(div6, t13);
    			append_dev(div6, div3);
    			append_dev(div3, h31);
    			append_dev(div3, t15);
    			append_dev(div3, p1);
    			append_dev(div3, t17);
    			append_dev(div3, img2);
    			append_dev(div6, t18);
    			append_dev(div6, div4);
    			append_dev(div4, h32);
    			append_dev(div4, t20);
    			append_dev(div4, p2);
    			append_dev(div4, t22);
    			append_dev(div4, img3);
    			append_dev(div6, t23);
    			append_dev(div6, div5);
    			append_dev(div5, h33);
    			append_dev(div5, t25);
    			append_dev(div5, p3);
    			append_dev(p3, t26);
    			append_dev(p3, a);
    			append_dev(div5, t28);
    			append_dev(div5, img4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "click", /*navigate1*/ ctx[0], false, false, false),
    					listen_dev(input1, "click", /*navigate2*/ ctx[1], false, false, false),
    					listen_dev(input2, "click", /*navigate3*/ ctx[2], false, false, false),
    					listen_dev(input3, "click", /*navigate4*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SimpleCV", slots, []);
    	const mySlider = document.getElementsByClassName("container");
    	const rad1 = document.getElementById("nav1");
    	const rad2 = document.getElementById("nav2");
    	const rad3 = document.getElementById("nav3");
    	const rad4 = document.getElementById("nav4");

    	const navigate1 = () => {
    		console.log("1");
    		location.href = "#sc1";
    	};

    	const navigate2 = () => {
    		console.log("2");
    		location.href = "#sc2";
    	};

    	const navigate3 = () => {
    		console.log("3");
    		location.href = "#sc3";
    	};

    	const navigate4 = () => {
    		console.log("4");
    		location.href = "#sc4";
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<SimpleCV> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		mySlider,
    		rad1,
    		rad2,
    		rad3,
    		rad4,
    		navigate1,
    		navigate2,
    		navigate3,
    		navigate4
    	});

    	return [navigate1, navigate2, navigate3, navigate4];
    }

    class SimpleCV extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SimpleCV",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\views\SarenGame.svelte generated by Svelte v3.28.0 */

    const file$1 = "src\\views\\SarenGame.svelte";

    function create_fragment$1(ctx) {
    	let canvas_1;
    	let canvas_1_width_value;
    	let canvas_1_height_value;

    	const block = {
    		c: function create() {
    			canvas_1 = element("canvas");
    			canvas_1.textContent = "Your browser does not support the canvas tag.";
    			attr_dev(canvas_1, "width", canvas_1_width_value = 1000);
    			attr_dev(canvas_1, "height", canvas_1_height_value = 1000);
    			attr_dev(canvas_1, "id", "myCanvas");
    			add_location(canvas_1, file$1, 4, 0, 38);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, canvas_1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(canvas_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SarenGame", slots, []);
    	let canvas;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SarenGame> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ canvas });

    	$$self.$inject_state = $$props => {
    		if ("canvas" in $$props) canvas = $$props.canvas;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class SarenGame extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SarenGame",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.28.0 */

    function create_fragment$2(ctx) {
    	let sarengame;
    	let current;
    	sarengame = new SarenGame({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(sarengame.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(sarengame, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sarengame.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sarengame.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sarengame, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ SimpleCV, SarenGame });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
