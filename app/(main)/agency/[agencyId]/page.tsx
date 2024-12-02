
const ComponentName = ({ params }: { params: { agencyId: string } }) => {
    return (
        <div>
            内容 {params.agencyId}
        </div>
    );
};

export default ComponentName;
