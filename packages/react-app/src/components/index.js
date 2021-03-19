import styled from "styled-components";

export const Header = styled.header`
  justify-content: space-between;
  background-color: #282c34;
  min-height: 70px;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: white;
`;

export const Header2 = styled.div`
  color: white;
  font-size: 2rem;
  display: inline-block;
  width: 75%;
`

export const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`
export const Element = styled.div`
  max-width: 43%;
  border: solid 1px white;
  border-radius: 5px;
  margin: 1%;
  padding: 1%;
  display: inline-block;
`
export const Input = styled.input`
  font-size: 18px;
  padding: 10px;
  margin: 10px;
  background: #282c34;
  border: white solid 1px;
  border-radius: 3px;
  color: white;
  ::placeholder {
    color: white;
  }
`

export const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
`

export const Body = styled.div`
  align-items: center;
  background-color: #282c34;
  color: white;
  display: flex;
  flex-direction: column;
  font-size: calc(10px + 2vmin);
  justify-content: center;
  min-height: calc(100vh - 70px);
  min-width: 100%;
  width: 100%;
`;

export const Image = styled.img`
  height: 10vmin;
  margin-bottom: 16px;
  pointer-events: none;
  max-width: 100%;
  display: inline-block;
  padding: 10px;
`;

export const Link = styled.a.attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: #61dafb;
  margin-top: 10px;
`;

export const Button = styled.button`
  background-color: white;
  border: none;
  border-radius: 8px;
  color: #282c34;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  margin: 0px 20px;
  padding: 12px 24px;

  ${props => props.hidden && "hidden"} :focus {
    border: none;
    outline: none;
  }
`;

