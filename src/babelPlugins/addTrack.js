module.exports = function (babel, options) {
    const { types, template } = babel;
    return {
        name: "add-track-babel-plugin",
        visitor: {
            Identifier(path, state) {
                const { name } = path.node;
                if (name.endsWith('_track')) {
                    try {
                        const parentNode = path.parent;
                        if (types.isFunctionExpression(parentNode.value)) {
                            const params = parentNode.value.params;
                            var s = '{'
                            params.forEach(p => {
                                s = s + p.name + ':' + p.name + ','
                            })
                            s = s + 'baseTrackProps: this.baseTrackProps}'
                            const tName = `'${name}'`
                            const addCodeStr = `this.$track(${tName},${s})`;
                            // 向函数内，插入埋点语句
                            const body = parentNode.value.body;
                            body.body.unshift(template.statement(addCodeStr)());
                        }
                    } catch (error) {

                    }
                }
            },
        }
    }
}

