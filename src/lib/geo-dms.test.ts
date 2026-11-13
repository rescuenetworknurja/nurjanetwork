import {expect,test} from "vitest";import {parseCoordPair} from "./geo";
test("x",()=>{expect(parseCoordPair(`23°38'18.5"N 90°26'07.5"E`)).toEqual({lat:23.6384722,lng:90.4354167});expect(parseCoordPair("23.6384699, 90.4354191")).toEqual({lat:23.6384699,lng:90.4354191});});
