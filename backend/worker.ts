import {handleClub} from './club-server';
export default {fetch(request:Request,env:{DB:D1Database}){return handleClub(request,env.DB)}};
