import { UserIcon } from '@heroicons/react/24/solid';

const Usuario = ({ usuario, onCerrarSesion }) => {
    return (
        <div className="flex items-center justify-end mt-2 mr-2">
            <div className="w-8 h-8 rounded-full border-2 border-green-forest flex items-center justify-center bg-green-forest/10 mr-2">
                <UserIcon className="w-6 h-6 text-green-forest" />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-green-forest">{usuario?.nombre || 'Usuario'}</span>
                <span 
                    onClick={onCerrarSesion}
                    className="text-green-dark font-bold cursor-pointer hover:text-green-forest transition-colors"
                >
                    | Cerrar sesión
                </span>
            </div>
        </div>
    );
}

export default Usuario;