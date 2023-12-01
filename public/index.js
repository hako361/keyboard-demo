window.onload = () => {
    const container = document.querySelector('.container')
    const textContainer = document.querySelector('.text-box')
    const models = {
        "1": new keyboard(),
        "2": new keyboard(),
        "3": new keyboard()
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
        this.count = this.row[this.r]
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
    }

    bindEvent() {
        if (this.device === 'pc') {
            Object.values(this.nodes.btns).map(btn => btn.onmousedown = (e) => this.handleTouchstartButton(e))
        } else {
            Object.values(this.nodes.btns).map(btn => btn.ontouchstart = (e) => this.handleTouchstartButton(e))
        }
    }

    getHTML() {
        let html = ''
        let hasSymbol = false
        for (const [key, item] of Object.entries(this.data)) {
            if (this.count === 0) {
                html += '</div><div class="row">'
                this.r++
                this.count = this.row[this.r]
                this.count--
            } else {
                this.count--
            }
            switch (item.text) {
                case 'space':
                    html += `<div class="btn-box ${hasSymbol ? 'space-2' : 'space'}"><div class="item" value="${item.text}">${item.text}</div></div>`
                    break;
                case 'up': case 'back': case 'face':
                    html += `<div class="btn-box icon"><div class="item" value="${item.text}">${item.icon}</div></div>`
                    break;
                case '123':
                    html += `<div class="btn-box icon color-2"><div class="item" value="${item.text}">${item.text}</div></div>`
                    break;
                case 'return':
                    html += `<div class="btn-box return color-2"><div class="item" value="${item.text}">${item.text}</div></div>`
                    break;
                case 'symbol':
                    hasSymbol = true
                    html += `<div class="btn-box icon"><div class="connect-word">${item.content.map(c => `<div class="word" value="${c}">${c}</div>`).join('')}</div>
                        <div class="item" value="${item.content[0]}">${item.content[0]}</div></div>`
                    break;
                case 'global': case 'mic':
                    html += `<div class="btn-box bottom"><div class="item" value="${item.text}">${item.icon}</div></div>`
                    break;
                default:
                    html += `<div class="btn-box">
                    <div class="connect-word">${item.content.map(c => `<div class="word" value="${c}">${c}</div>`).join('')}</div>
                    <div class="item" value="${item.text}" data-down="${item.text}" ${item.up ? `data-up="${item.up}"` : ''}>${item.text}</div>
                    <div class="top-word">${item.text}</div></div>`
                    break;
            }
        }
        return `<div class="keyboard-border">
            <div class="title">${this.title}</div>
            <div class="keyboard-container">
                <div class="row">${html}</div>
            </div>
        </div>`
    }


    handleTouchstartButton(e) {
        e.preventDefault()
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
            this.showContent(this.hoverItem, '')
            this.hoverItem = ''
            this.handleTouchendButton()
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
        } else {
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
                case "123": case "face": case "return": case "global": case "mic":
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
            if(this.hoverItem.parentNode.querySelector('.connect-word')) {
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



