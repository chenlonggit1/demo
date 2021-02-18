
export function getNodeChildByName(n:cc.Node,childPath:string,component?:any):any
{
    let childs = childPath.split("/");
    while(childs.length>0)
    {
        n = n.getChildByName(childs.shift());
        if(n==null||childs.length==0)
        {
            if(n!=null&&component!=null)
                return n.getComponent(component);
            else return n;
        }
    }
    return null;
    
}
