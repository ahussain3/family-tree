
class PannableContainer {
    constructor(container, content) {
        this.container = container
        this.content = content
        this.contentPosition = {
            x: null,
            y: null,
        }
        this.startPosition = {
            x: null,
            y: null,
        }
        this.makePannable()
    }

    panToPosition = (element, x, y) => {
        let conW = this.container.offsetWidth
        let conH = this.container.offsetHeight

        let el = element.offsetLeft
        let et = element.offsetTop
        let ew = element.offsetWidth
        let eh = element.offsetHeight

        this.content.style.left = (conW / 2 - ew / 2 - el + x).toString() + "px"
        this.content.style.top = (conH / 2 - eh / 2 - et + y).toString() + "px"
    }

    getElementPosition = (element) => {
        let conW = this.container.offsetWidth
        let conH = this.container.offsetHeight

        let ew = element.offsetWidth
        let eh = element.offsetHeight

        let x =  this.content.offsetLeft + element.offsetLeft - conW / 2 + ew / 2
        let y = this.content.offsetTop + element.offsetTop - conH / 2 + eh / 2

        return [x, y]
    }

    startPan = (event, value) => {
        this.container.addEventListener("mousemove", this.trackMouse);
        this.startPosition.x = event.clientX
        this.startPosition.y = event.clientY
        this.contentPosition.x = this.content.offsetLeft
        this.contentPosition.y = this.content.offsetTop
    }

    endPan = (event, value) => {
        this.container.removeEventListener("mousemove", this.trackMouse);
        this.startPosition.x = null
        this.startPosition.y = null
    }

    trackMouse = (event, value) => {
        let offsetX = event.clientX - this.startPosition.x
        let offsetY = event.clientY - this.startPosition.y

        this.content.style.left = (this.contentPosition.x + offsetX).toString() + "px"
        this.content.style.top = (this.contentPosition.y + offsetY).toString() + "px"
    }


    makePannable = () => {
        this.container.addEventListener("mousedown", this.startPan);
        this.container.addEventListener("mouseup", this.endPan);
    }
}