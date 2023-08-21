function postcssReplaceRootToHost() {
    return {
        postcssPlugin: 'postcss-replace-root-to-host',
        Once(root) {
            root.walkRules(rule => {
                if (rule.selector === ':root') {
                    rule.assign({selector: ':host'});
                }
            });
        },
    };
}

postcssReplaceRootToHost.postcss = true;

export default postcssReplaceRootToHost;
