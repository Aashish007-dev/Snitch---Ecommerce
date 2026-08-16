import { setUser, setLoading, setError, logout } from "../state/auth.slice";
import { register, login, getMe, logout as logoutApi } from "../service/auth.api";
import { useDispatch } from "react-redux";

export const useAuth = () => {

    const dispatch = useDispatch();

    async function handleRegister({fullname, email, contact, password, isSeller = false}){
        const data = await register({fullname, email, contact, password, isSeller});

        dispatch(setUser(data.user));
        return data.user

    }

    async function handleLogin ({email, password}) {
        const data = await login({email, password});
        dispatch(setUser(data.user));
        return data.user
    }

    async function handleGetMe () {
        try {
            dispatch(setLoading(true));
            const data = await getMe();
            dispatch(setUser(data.user));
        } catch (error) {
            console.log(error);
        } finally{
            dispatch(setLoading(false));
        }
    }

    async function handleLogout () {
        try {
            await logoutApi();
        } catch (error) {
            console.log(error);
        } finally {
            dispatch(logout());
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout
    }
}