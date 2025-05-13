/**
 * Vue 渲染函数与JSX
 *
 * 面试题：请解释Vue中的渲染函数(Render Function)和JSX的使用场景及优势
 */

/**
 * 1. 基本渲染函数
 */

// 使用模板的组件
const TemplateComponent = {
  props: {
    level: {
      type: Number,
      required: true
    },
    title: String
  },
  template: `
    <div class="heading-wrapper">
      <h1 v-if="level === 1">{{ title }}</h1>
      <h2 v-else-if="level === 2">{{ title }}</h2>
      <h3 v-else-if="level === 3">{{ title }}</h3>
      <h4 v-else-if="level === 4">{{ title }}</h4>
      <h5 v-else-if="level === 5">{{ title }}</h5>
      <h6 v-else-if="level === 6">{{ title }}</h6>
      <p v-else>{{ title }}</p>
    </div>
  `
};

// 使用渲染函数重写
const RenderFunctionComponent = {
  props: {
    level: {
      type: Number,
      required: true
    },
    title: String
  },
  render(h) {
    // h是createElement函数的别名
    // 参数1: 标签名称或组件
    // 参数2: 数据对象(属性、事件等)
    // 参数3: 子节点数组或文本内容
    return h('div', 
      { class: 'heading-wrapper' },
      [
        h(`h${this.level <= 6 ? this.level : 'p'}`, this.title)
      ]
    );
  }
};

/**
 * 2. 渲染函数的数据对象
 */

// 详细的数据对象示例
const DetailedRenderFunction = {
  render(h) {
    return h('div', 
      {
        // 与v-bind:class相同的API
        class: {
          active: this.isActive,
          'text-danger': this.hasError
        },
        // 与v-bind:style相同的API
        style: {
          color: this.color,
          fontSize: this.fontSize + 'px'
        },
        // 普通的HTML属性
        attrs: {
          id: 'my-div',
          'data-custom': 'custom-value'
        },
        // 组件props
        props: {
          myProp: 'value'
        },
        // DOM属性
        domProps: {
          innerHTML: '<span>内部HTML</span>'
        },
        // 事件监听器
        on: {
          click: this.handleClick,
          // 支持修饰符
          '!click': this.handleCaptureClick, // capture
          '~keyup': this.handleKeyup, // once
          '&keydown': this.handleKeydown, // passive
          '~!keypress': this.handleKeypress // once + capture
        },
        // 仅用于组件，监听原生事件
        nativeOn: {
          click: this.nativeClickHandler
        },
        // 自定义指令
        directives: [
          {
            name: 'my-directive',
            value: 'value',
            expression: 'expression',
            arg: 'arg',
            modifiers: {
              mod: true
            }
          }
        ],
        // 作用域插槽
        scopedSlots: {
          default: props => h('span', props.text)
        },
        // 如果组件是其他组件的子组件，指定插槽名
        slot: 'name-of-slot',
        // 其他特殊顶层属性
        key: 'myKey',
        ref: 'myRef'
      },
      [
        // 子节点
        '文本节点',
        h('span', '更多文本'),
        h(ComponentA, { props: { msg: 'Hello' } })
      ]
    );
  }
};

/**
 * 3. 使用JavaScript代替模板功能
 */

// v-if/v-else/v-for的渲染函数替代
const ConditionalRenderFunction = {
  props: ['items', 'condition'],
  render(h) {
    // v-if 替代
    if (this.condition) {
      return h('div', 'Condition is true');
    } else {
      return h('span', 'Condition is false');
    }
  }
};

const ListRenderFunction = {
  props: ['items'],
  render(h) {
    // v-for 替代
    if (!this.items || this.items.length === 0) {
      return h('p', 'No items found.');
    }
    
    return h('ul', 
      this.items.map((item, index) => 
        h('li', { key: item.id }, [
          h('span', `${index + 1}. ${item.name}`)
        ])
      )
    );
  }
};

// v-model的替代
const ModelRenderFunction = {
  props: ['value'],
  render(h) {
    return h('input', {
      attrs: {
        value: this.value
      },
      on: {
        input: event => {
          this.$emit('input', event.target.value);
        }
      }
    });
  }
};

/**
 * 4. 事件与修饰符
 */

// 事件处理
const EventHandlingRender = {
  methods: {
    handleClick(event) {
      console.log('Clicked!', event);
    },
    handleKeyup(event) {
      if (event.key === 'Enter') {
        console.log('Enter pressed!');
      }
    }
  },
  render(h) {
    // 事件处理
    return h('div', [
      // 基本事件
      h('button', {
        on: { click: this.handleClick }
      }, 'Click me'),
      
      // 事件修饰符
      h('input', {
        on: {
          keyup: event => {
            // .enter
            if (event.key === 'Enter') {
              this.handleKeyup(event);
            }
          },
          click: event => {
            // .stop
            event.stopPropagation();
            // .prevent
            event.preventDefault();
            this.handleClick(event);
          }
        }
      })
    ]);
  }
};

/**
 * 5. 插槽
 */

// 默认插槽和具名插槽
const SlotsInRender = {
  render(h) {
    // 获取默认插槽内容
    const defaultSlot = this.$slots.default || [];
    
    // 获取具名插槽内容
    const headerSlot = this.$slots.header || [];
    const footerSlot = this.$slots.footer || [];
    
    return h('div', { class: 'container' }, [
      h('header', { class: 'header' }, headerSlot),
      h('main', { class: 'content' }, defaultSlot),
      h('footer', { class: 'footer' }, footerSlot)
    ]);
  }
};

// 作用域插槽
const ScopedSlotsInRender = {
  props: ['items'],
  render(h) {
    return h('div', { class: 'list-container' }, [
      h('ul', this.items.map(item => {
        // 使用作用域插槽
        const scopedSlot = this.$scopedSlots.item;
        
        if (scopedSlot) {
          // 传递数据给插槽
          return h('li', { key: item.id }, [
            scopedSlot({ item, index: this.items.indexOf(item) })
          ]);
        }
        
        // 默认渲染
        return h('li', { key: item.id }, item.name);
      }))
    ]);
  }
};

// 使用上面的组件
const UsingScopedSlots = {
  render(h) {
    return h(ScopedSlotsInRender, {
      props: { items: this.items },
      scopedSlots: {
        item: props => h('div', [
          h('strong', props.item.name),
          h('em', ` (${props.index + 1} of ${this.items.length})`)
        ])
      }
    });
  }
};

/**
 * 6. 函数式组件
 */

// 函数式组件 - 无状态，无实例
const FunctionalComponent = {
  functional: true,
  props: ['level', 'title'],
  render(h, context) {
    // context包含:
    // props: 提供props的对象
    // children: VNode子节点的数组
    // slots: 一个函数，返回了包含所有插槽的对象
    // scopedSlots: 作用域插槽的对象
    // data: 传递给组件的整个数据对象
    // parent: 对父组件的引用
    // listeners: 所有父组件监听的事件的对象
    // injections: 如果使用了inject选项，则包含了应当被注入的属性
    
    const { props, children, data } = context;
    const tag = `h${props.level <= 6 ? props.level : 'p'}`;
    
    return h('div', 
      { class: 'heading-wrapper', ...data },
      [h(tag, props.title)]
    );
  }
};

/**
 * 7. JSX in Vue
 * 
 * 需要安装 @vue/babel-preset-jsx 插件
 */

// 使用JSX的组件
const JSXComponent = {
  props: ['level', 'title'],
  data() {
    return {
      isActive: true
    };
  },
  methods: {
    handleClick() {
      console.log('Clicked!');
    }
  },
  render() {
    const Tag = `h${this.level <= 6 ? this.level : 'p'}`;
    
    return (
      <div class={{wrapper: true, active: this.isActive}} onClick={this.handleClick}>
        <Tag>{this.title}</Tag>
        {this.$slots.default}
        <button onClick={() => this.isActive = !this.isActive}>
          Toggle Active
        </button>
      </div>
    );
  }
};

// 条件渲染和列表渲染
const JSXAdvanced = {
  props: ['items', 'showHeader'],
  render() {
    return (
      <div>
        {/* 条件渲染 */}
        {this.showHeader && <header>Header Content</header>}
        
        {/* 列表渲染 */}
        <ul>
          {this.items.map(item => (
            <li key={item.id}>
              <span>{item.name}</span>
              {item.description && <p>{item.description}</p>}
            </li>
          ))}
        </ul>
        
        {/* 使用插槽 */}
        <div class="footer">
          {this.$slots.footer || <p>Default Footer</p>}
        </div>
      </div>
    );
  }
};

// 使用作用域插槽
const JSXWithScopedSlots = {
  props: ['items'],
  render() {
    return (
      <div>
        <ul>
          {this.items.map(item => {
            // 使用作用域插槽
            const scopedSlot = this.$scopedSlots.item;
            
            if (scopedSlot) {
              return <li key={item.id}>{scopedSlot({ item })}</li>;
            }
            
            return <li key={item.id}>{item.name}</li>;
          })}
        </ul>
      </div>
    );
  }
};

// 使用上面的组件
const UsingJSXScopedSlots = {
  render() {
    return (
      <JSXWithScopedSlots items={this.items} scopedSlots={{
        item: ({ item }) => (
          <div>
            <strong>{item.name}</strong>
            <button onClick={() => this.handleItemClick(item)}>
              View Details
            </button>
          </div>
        )
      }} />
    );
  }
};

/**
 * 8. 渲染函数与JSX的优势与使用场景
 * 
 * 优势:
 * 1. 完全的JavaScript编程能力
 * 2. 更灵活的组件设计
 * 3. 性能优化（直接操作虚拟DOM）
 * 4. 复杂条件逻辑更清晰
 * 
 * 使用场景:
 * 1. 高度动态的组件
 * 2. 需要基于条件渲染不同根元素的组件
 * 3. 需要以编程方式操作插槽内容
 * 4. 开发高度可复用的UI库组件
 * 5. 需要精确控制更新的性能关键组件
 */

/**
 * 9. Vue3中的渲染函数变化
 */

// Vue3渲染函数示例
/*
import { h, ref } from 'vue';

export default {
  props: {
    level: Number,
    title: String
  },
  setup(props) {
    const isActive = ref(true);
    
    const toggle = () => {
      isActive.value = !isActive.value;
    };
    
    return () => {
      const tag = `h${props.level <= 6 ? props.level : 'p'}`;
      
      return h('div', 
        { 
          class: { 
            wrapper: true, 
            active: isActive.value 
          },
          onClick: () => console.log('Clicked!')
        }, 
        [
          h(tag, props.title),
          h('button', { onClick: toggle }, 'Toggle Active')
        ]
      );
    };
  }
};
*/

// Vue3 JSX示例
/*
import { ref } from 'vue';

export default {
  props: {
    level: Number,
    title: String
  },
  setup(props, { slots }) {
    const isActive = ref(true);
    
    const toggle = () => {
      isActive.value = !isActive.value;
    };
    
    return () => {
      const Tag = `h${props.level <= 6 ? props.level : 'p'}`;
      
      return (
        <div class={{ wrapper: true, active: isActive.value }} onClick={() => console.log('Clicked!')}>
          <Tag>{props.title}</Tag>
          {slots.default?.()}
          <button onClick={toggle}>Toggle Active</button>
        </div>
      );
    };
  }
};
*/ 