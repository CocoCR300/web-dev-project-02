export interface ApolloServerContext
{
	token?: TokenClaims;
}

export interface TokenClaims
{
	iat: number;
	iss: string;
	name: string;
	sub: number;
}

export interface IdResult
{
	id: number | null;
}
