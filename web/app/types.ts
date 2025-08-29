export type User = {
    UserName: string;
    SessionID: string;
    CurrentPackageId: string;
}

export type StoreState = {
    user: User;
}