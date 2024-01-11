window.onload = () => {
    const container = document.querySelector('.container')
    const textContainer = document.querySelector('.text-box')
    const models = {
        "1": new keyboard(),
        "2": new keyboard(),
        "3": new keyboard(),
        "4": new keyboard()
    }
    for (const [key, model] of Object.entries(models)) {
        model.setContainer(container)
        model.setInputBox(textContainer)
        model.setData(datas[key])
        model.init()
    }
}


class keyboard {
    row
    r = 0
    count
    data
    nodes = []
    hoverItem = ''
    activeItem
    isup = false
    backTimer = ''
    hoverTimer = ''
    hoverLock = true
    x
    activeX
    activeContent
    device = 'pc'
    title

    setContainer(container) {
        this.nodes.container = container
    }

    setInputBox(box) {
        this.nodes.box = box
    }

    setData(allData) {
        this.data = allData.data
        this.row = allData.row
        this.title = allData.title
    }

    init() {
        if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
            this.device = 'mobile'
        }
        this.buildElement()
        this.updateNode()
        this.bindEvent()
    }

    /**
     * 建立元素
     */
    buildElement() {
        const html = this.getHTML();
        this.nodes.container.insertAdjacentHTML('beforeend', html)
    }

    /**
     * 更新節點
     */
    updateNode() {
        const node = this.nodes.container.lastChild;
        this.nodes.template = node;
        this.nodes.btns = this.nodes.template.querySelectorAll('.item')
        this.nodes.title = this.nodes.template.querySelector('.title')

        this.nodes.title.style.width = this.title.length * 25 + 'px'
        this.nodes.title.style.right = `calc(50% - ${this.title.length * 12.5}px)`
    }

    bindEvent() {
        if (this.device === 'pc') {
            Object.values(this.nodes.btns).map(btn => btn.onmousedown = (e) => this.handleTouchstartButton(e))
        } else {
            Object.values(this.nodes.btns).map(btn => btn.ontouchstart = (e) => this.handleTouchstartButton(e))
        }
    }

    getHTML() {
        let html = []
        let hasSymbol = false
        let os = 'ios'
        if (this.title.includes('常駐')) {
            os = 'android'
        }
        for (const [key, item] of Object.entries(this.data)) {
            console.log(key)
            this.r = 0
            this.count = this.row[key][this.r]
            html[key] = ''
            for (const [k, i] of Object.entries(item)) {
                if (this.count === 0) {
                    html[key] += '</div><div class="row">'
                    this.r++
                    this.count = this.row[key][this.r]
                    this.count--
                } else {
                    this.count--
                }
                switch (i.text) {
                    case 'space':
                        html[key] += `<div class="btn-box ${hasSymbol ? 'space-2' : 'space'}" data-no="${k}"><div class="item" value="${i.text}">${i.text}</div>
                    </div>`
                        break;
                    case 'up': case 'back': case 'face':
                        html[key] += `<div class="btn-box icon" data-no="${k}"><div class="item" value="${i.text}">${i.icon}</div></div>`
                        break;
                    case '#+=':
                        html[key] += `<div class="btn-box big color-2 fs-12px" data-no="${k}"><div class="item" value="${i.text}">${i.text}</div></div>`
                        break;
                    case '123': case 'ABC':
                        html[key] += `<div class="btn-box icon color-2" data-no="${k}"><div class="item" value="${i.text}">${i.text}</div></div>`
                        break;
                    case 'return':
                        html[key] += `<div class="btn-box return color-2" data-no="${k}"><div class="item" value="${i.text}"><img src="./public/enter.svg"></div></div>`
                        break;
                    case 'symbol':
                        hasSymbol = true
                        html[key] += `<div class="btn-box icon" data-no="${k}"><div class="connect-word">${i.content.map(c => `<div class="word" value="${c}">${c}</div>`).join('')}</div>
                        <div class="item" value="${i.content[0]}">${i.content[0]}</div>
                        <div class="top-word">${i.content[0]}</div>
                        </div>`
                        break;
                    case 'global': case 'mic':
                        html[key] += `<div class="btn-box bottom" data-no="${k}"><div class="item" value="${i.text}">${i.icon}</div></div>`
                        break;
                    case '.': case ',': case '?': case '!': case 'ʼ':
                        html[key] += `<div class="btn-box big" data-no="${k}">
                        <div class="connect-word">${i.content.map(c => `<div class="word" value="${c}">${c}</div>`).join('')}</div>
                        <div class="item" value="${i.text}" data-down="${i.text}" ${i.up ? `data-up="${i.up}"` : ''}>${i.text}</div>
                        <div class="top-word">${i.text}</div>
                        </div>`
                        break;
                    default:
                        html[key] += `<div class="btn-box" data-no="${k}">
                    <div class="connect-word">${i.content.map(c => `<div class="word" value="${c}">${c}</div>`).join('')}</div>
                    <div class="item" value="${i.text}" data-down="${i.text}" ${i.up ? `data-up="${i.up}"` : ''}>${i.text}</div>
                    <div class="top-word">${i.text}</div>
                    </div>`
                        break;
                }
            }
        }
        return `<div class="keyboard-border ${os === 'android'? 'android': 'ios'}">
            <div class="title">${this.title}</div>
            <div key="1" class="keyboard-container">
                <div class="row">${html[1]}</div>
            </div>
            <div key="2" class="keyboard-container d-none">
                <div class="row">${html[2]}</div>
            </div>
        </div>`
    }


    handleTouchstartButton(e) {
        e.preventDefault()
        if (this.hoverItem) {
            return
        }
        let y
        if (this.device === 'pc') {
            this.x = e.clientX
            y = e.clientY
        } else {
            this.x = e.touches[0].clientX
            y = e.touches[0].clientY
        }
        let swapItem = document.elementFromPoint(this.x, y) === null ? '' : document.elementFromPoint(this.x, y)
        this.showContent(swapItem, 'show')
        this.hoverItem = swapItem
        this.activeItem = ''
        if (this.device === 'pc') {
            this.nodes.template.onmousemove = (e) => this.handleTouchmove(e)
            this.nodes.template.onmouseup = (e) => this.handleTouchendButton(e)
        } else {
            this.nodes.template.ontouchmove = (e) => this.handleTouchmove(e)
            this.nodes.template.ontouchend = (e) => this.handleTouchendButton(e)
        }
        this.hoverTimer = setTimeout(() => {
            this.hoverLock = false
            this.showContent(this.hoverItem, 'show')
        }, 500)
    }

    handleTouchmove(e) {
        e.preventDefault()
        const keyboard = this.nodes.template.getBoundingClientRect()
        let y
        const divLeft = keyboard.left
        const divTop = keyboard.top
        const divRight = keyboard.right
        const divBottom = keyboard.bottom
        if (this.device === 'pc') {
            this.x = e.clientX
            y = e.clientY
        } else {
            this.x = e.touches[0].clientX
            y = e.touches[0].clientY
        }
        // 不得超過此node範圍
        if (this.x < divLeft || this.x > divRight || y < divTop || y > divBottom) {
            this.handleTouchendButton()
            this.showContent(this.hoverItem, '')
            this.hoverItem = ''
        }
        if (this.activeContent) {
            const totalItem = Object.values(this.activeContent).length
            if (this.activeX - this.x > 10) {
                if (this.activeItem > 0) {
                    this.activeContent[this.activeItem].classList.toggle('active', false)
                    this.activeItem--
                    this.activeContent[this.activeItem].classList.toggle('active', true)
                }
                this.activeX = this.x
            } else if (this.x - this.activeX > 10) {
                if (this.activeItem + 1 < totalItem) {
                    this.activeContent[this.activeItem].classList.toggle('active', false)
                    this.activeItem++
                    this.activeContent[this.activeItem].classList.toggle('active', true)
                }
                this.activeX = this.x
            }
        } else if (this.backTimer === '') {
            let swapItem = document.elementFromPoint(this.x, y) === null ? hoverItem : document.elementFromPoint(this.x, y)
            if (swapItem.classList.contains('item')) {
                if (this.hoverItem) {
                    this.showContent(this.hoverItem, '')
                }
                this.showContent(swapItem, 'show')
                this.hoverItem = swapItem
                clearTimeout(this.hoverTimer)
                this.hoverTimer = setTimeout(() => {
                    this.hoverLock = false
                    this.showContent(this.hoverItem, 'show')
                }, 500)
            } else if (swapItem.classList.contains('word')) {
                this.activeItem.classList.toggle('active', false)
                swapItem.classList.toggle('active', true)
                this.activeItem = swapItem
            } else {
                if (this.hoverItem) {
                    this.hoverItem.classList.toggle('hover', false)
                }
            }
        }
    }

    showContent(item, status) {
        if (status === 'show') {
            item.classList.toggle('hover', true)
            if (item.parentNode.querySelector('.top-word')) {
                const w = item.parentNode.querySelector('.top-word')
                w.style.left = (item.clientWidth - w.clientWidth) / 2 + 'px'
            }
            if (item.parentNode.querySelector('.connect-word') && !this.hoverLock) {
                item.parentNode.querySelector('.connect-word').classList.toggle('show', true)
                Object.values(item.parentNode.querySelectorAll('.connect-word div')).map(d => d.style.width = item.clientWidth + 'px')
                const keyboard = this.nodes.template.getBoundingClientRect()
                const content = item.parentNode.querySelector('.connect-word').getBoundingClientRect()
                if (content.right > keyboard.right) {
                    item.parentNode.querySelector('.connect-word').style.right = - (keyboard.right - item.getBoundingClientRect().right - 2) + 'px'
                    item.parentNode.querySelector('.connect-word').style.left = 'auto'
                }
                item.classList.toggle('show', true)
                if (this.activeItem) {
                    this.activeItem.classList.toggle('active', false)
                }
                this.activeX = this.x
                this.activeContent = item.parentNode.querySelector('.connect-word').querySelectorAll('div')
                this.activeItem = 0
                this.activeContent[this.activeItem].classList.toggle('active', true)
            } else if (item.getAttribute('value') === 'back' && !this.hoverLock) {
                this.backTimer = setInterval(() => {
                    this.nodes.box.value = this.nodes.box.value.substring(0, this.nodes.box.value.length - 1)
                }, 50)
            }
        } else {
            item.classList.toggle('hover', false)
            if (item.parentNode.querySelector('.connect-word')) {
                item.classList.toggle('show', false)
                item.parentNode.querySelector('.connect-word').classList.toggle('show', false)
            }
        }
    }

    handleTouchendButton(e) {
        if (e) {
            e.preventDefault()
        }
        let item
        if (this.activeContent) {
            item = this.activeContent[this.activeItem]
            this.activeContent[this.activeItem].classList.toggle('active', false)
            this.activeContent = ''
        } else {
            item = this.hoverItem
        }
        console.log()
        if (item) {
            let text = item.getAttribute('value')
            switch (text) {
                case "up":
                    Object.values(this.nodes.btns).map(btn => {
                        if (btn.getAttribute('data-up')) {
                            if (!this.isup) {
                                btn.innerText = btn.getAttribute('data-up')
                                btn.setAttribute('value', btn.getAttribute('data-up'))
                                btn.parentNode.querySelector('.connect-word').firstChild.innerText = btn.getAttribute('data-up')
                                btn.parentNode.querySelector('.connect-word').firstChild.setAttribute('value', btn.getAttribute('data-up'))
                                btn.parentNode.querySelector('.top-word').innerText = btn.getAttribute('data-up')
                            } else {
                                btn.innerText = btn.getAttribute('data-down')
                                btn.setAttribute('value', btn.getAttribute('data-down'))
                                btn.parentNode.querySelector('.connect-word').firstChild.innerText = btn.getAttribute('data-down')
                                btn.parentNode.querySelector('.connect-word').firstChild.setAttribute('value', btn.getAttribute('data-down'))
                                btn.parentNode.querySelector('.top-word').innerText = btn.getAttribute('data-down')
                            }
                        }
                        if (this.data[btn.parentNode.parentNode.parentNode.getAttribute('key')][btn.parentNode.getAttribute('data-no')].content_up) {
                            if (!this.isup) {
                                console.log(btn.parentNode.querySelector('.connect-word').innerHTML)
                                btn.parentNode.querySelector('.connect-word').innerHTML = this.data[1][btn.parentNode.getAttribute('data-no')].content_up.map(c => `<div class="word" value="${c}">${c}</div>`).join('')
                            } else {
                                btn.parentNode.querySelector('.connect-word').innerHTML = this.data[1][btn.parentNode.getAttribute('data-no')].content.map(c => `<div class="word" value="${c}">${c}</div>`).join('')
                            }
                        }
                    })
                    text = ''
                    this.isup = !this.isup
                    break;
                case "space":
                    text = ' '
                    break;
                case "back":
                    text = ''
                    this.nodes.box.value = this.nodes.box.value.substring(0, this.nodes.box.value.length - 1)
                    break;
                case "123": case "ABC":
                    text = ''
                    Object.values(this.nodes.template.querySelectorAll('.keyboard-container')).map(k => {
                        console.log(k)
                        console.log(item.parentNode.parentNode.parentNode)
                        if(k === item.parentNode.parentNode.parentNode) {
                            k.classList.toggle('d-none', true)
                        }else {
                            k.classList.toggle('d-none', false)
                        }
                    })
                    break;
                case "123": case "face": case "return": case "global": case "mic": case '#+=':
                    text = ''
                    break;
                default:
                    break;
            }
            this.nodes.box.value = this.nodes.box.value + text
        }
        if (this.hoverItem) {
            this.hoverItem.classList.toggle('hover', false)
            this.hoverItem.classList.toggle('show', false)
            if (this.hoverItem.parentNode.querySelector('.connect-word')) {
                this.hoverItem.parentNode.querySelector('.connect-word').classList.toggle('show', false)
            }
            this.hoverItem = ''
        }
        this.nodes.template.onmousemove = ''
        this.nodes.template.onmouseup = ''
        this.nodes.template.ontouchmove = ''
        this.nodes.template.ontouchend = ''
        clearTimeout(this.backTimer)
        clearTimeout(this.hoverTimer)
        this.hoverLock = true
    }
}



