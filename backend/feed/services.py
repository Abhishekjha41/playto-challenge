def build_comment_tree(comments):
    by_parent = {}

    for c in comments:
        by_parent.setdefault(c.parent_id, []).append(c)

    def build(node):
        return {
            "id": node.id,
            "body": node.body,
            "author": node.author.username,
            "created_at": node.created_at,
            "like_count": node._like_count,
            "children": [build(child) for child in by_parent.get(node.id, [])]
        }

    roots = by_parent.get(None, [])
    return [build(r) for r in roots]
